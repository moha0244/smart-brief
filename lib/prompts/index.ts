// lib/prompts/index.ts

export const PROMPTS = {
  // Prompt pour générer des résumés
  RESUME: {
    COURT: (
      content: string,
    ) => `Analyse le texte suivant et génère un résumé très court (2-3 phrases).

Texte: ${content}

Format de réponse souhaité (en JSON):
{
  "overview": "résumé",
  "keyPoints": ["point 1", "point 2"]
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`,

    MOYEN: (
      content: string,
    ) => `Analyse le texte suivant et génère un résumé moyen (1 paragraphe).

Texte: ${content}

Format de réponse souhaité (en JSON):
{
  "overview": "résumé",
  "keyPoints": ["point 1", "point 2"]
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`,

    APPROFONDI: (
      content: string,
    ) => `Analyse le texte suivant et génère un résumé détaillé (avec points clés, définitions et à retenir).

Texte: ${content}

Format de réponse souhaité (en JSON):
{
  "overview": "résumé général",
  "keyPoints": ["point 1", "point 2"],
  "definitions": [{"term": "mot", "definition": "explication"}],
  "takeaways": ["conclusion 1", "conclusion 2"]
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`,
  },

  // Prompt pour générer des flashcards
  FLASHCARDS: (
    content: string,
    pageCount: number,
  ) => `Analyse le texte suivant et génère ${Math.min(pageCount, 10)} flashcards pertinentes. Chaque flashcard doit contenir une question claire et sa réponse précise basée sur le contenu.

Texte: ${content}

Format JSON requis:
{ 
  "flashcards": [
    { 
      "page": 1, 
      "question": "Quelle est la définition de... ?", 
      "answer": "La définition est..." 
    }
  ] 
}

Instructions:
- Les questions doivent tester la compréhension des concepts clés
- Les réponses doivent être précises et concises
- Indiquer la page approximative où se trouve l'information
- Varier les types de questions (définitions, applications, comparaisons, etc.)

Réponds UNIQUEMENT avec le JSON valide, sans aucun texte supplémentaire.`,

  // Prompt pour le chat avec le document
  CHAT: (
    context: string,
    question: string,
  ) => `Tu es un assistant spécialisé dans l'analyse de documents.

Ta mission est de répondre de façon utile, claire et rigoureuse à partir du document fourni, tout en utilisant ton raisonnement lorsque c'est nécessaire.

CONTEXTE DOCUMENTAIRE:
${context || "Aucun contexte spécifique trouvé."}

QUESTION:
${question}

INSTRUCTIONS:
1. Utilise en priorité les informations présentes dans le CONTEXTE DOCUMENTAIRE.
2. Si le contexte contient la réponse, réponds précisément en t'appuyant dessus.
3. Si le contexte est partiel ou ambigu, complète avec ton raisonnement général de manière prudente.
4. Si la question dépasse le document, tu peux utiliser tes connaissances générales pour aider, mais tu dois le signaler clairement.
5. Distingue toujours :
   - ce qui vient du document,
   - ce qui est déduit par raisonnement,
   - ce qui vient de connaissances générales hors document.
6. Si une information importante manque, dis-le explicitement au lieu d'inventer.
7. Si la question demande une comparaison, une synthèse ou un calcul, réalise-le étape par étape.
8. Si plusieurs interprétations sont possibles, indique la plus probable et mentionne les alternatives.

FORMAT DE RÉPONSE ATTENDU:
- Réponse courte et directe d'abord
- Puis, si utile :
  - "Selon le document"
  - "Déduction / analyse"
  - "Complément hors document"

RÉPONSE:
`,

  // Prompt pour l'OCR avec Gemini Vision
  OCR: `Extrais tout le texte de ce document PDF scanné.
    
Instructions:
- Analyse chaque page une par une
- Numérote chaque page clairement (Page 1:, Page 2:, etc.)
- Si une page ne contient pas de texte, indique "Page X: [vide]"
- Transcris uniquement le texte visible, pas les images ou graphiques
- Sois précis et complet
- Retourne UNIQUEMENT le texte extrait, sans commentaires supplémentaires

Format attendu:
Page 1:
[texte de la page 1]

Page 2:
[texte de la page 2]

etc.`,
};

// Templates de prompts réutilisables
// export const PROMPT_TEMPLATES = {
//   // Template pour les prompts d'analyse
//   ANALYSIS: (task: string, content: string, format: string) => `
// Analyse ${task} le texte suivant.

// Texte: ${content}

// ${format}
// `.trim(),

//   // Template pour les prompts de génération
//   GENERATION: (type: string, instructions: string, content: string) => `
// Génère ${type} basé sur le contenu suivant.

// ${instructions}

// Texte: ${content}
// `.trim(),

//   // Template pour les prompts de Q&A
//   QA: (context: string, question: string) => `
// En te basant sur le contexte suivant, réponds à la question.

// CONTEXTE:
// ${context}

// QUESTION: ${question}

// RÉPONSE:
// `.trim()
// };

// // Prompts utilitaires
// export const UTILITY_PROMPTS = {
//   // Pour extraire des mots-clés
//   KEYWORDS: (content: string) => `Extrais les 10 mots-clés les plus importants du texte suivant.

// Texte: ${content.substring(0, 2000)}

// Format de réponse:
// ["mot1", "mot2", "mot3", ...]`,

//   // Pour résumer en une phrase
//   ONE_SENTENCE: (content: string) => `Résume le texte suivant en UNE seule phrase.

// Texte: ${content.substring(0, 3000)}

// Résumé:`,

//   // Pour extraire les définitions
//   DEFINITIONS: (content: string) => `Extrais toutes les définitions importantes du texte suivant.

// Texte: ${content.substring(0, 3000)}

// Format de réponse:
// [
//   {"term": "terme1", "definition": "définition1"},
//   {"term": "terme2", "definition": "définition2"}
// ]`
// };

// Fonctions utilitaires pour les prompts
export const buildPrompt = (
  template: string,
  variables: Record<string, string>,
) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
};

export const getPromptByLength = (
  content: string,
  length: "court" | "moyen" | "approfondi",
) => {
  switch (length) {
    case "court":
      return PROMPTS.RESUME.COURT(content);
    case "moyen":
      return PROMPTS.RESUME.MOYEN(content);
    case "approfondi":
      return PROMPTS.RESUME.APPROFONDI(content);
    default:
      return PROMPTS.RESUME.MOYEN(content);
  }
};
