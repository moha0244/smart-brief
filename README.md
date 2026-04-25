# Smart Brief - Application d'Analyse de Documents PDF

Smart Brief est une application web intelligente qui vous aide à analyser et comprendre vos documents PDF grâce à des résumés automatiques, des flashcards interactives et un chat intelligent.

## Fonctionnalités

- **Upload de documents PDF** : Importez facilement vos fichiers PDF
- **Extraction de texte intelligente** : pdf-parse + OCR (Mistral Vision) pour les documents scannés
- **Résumés automatiques** : Générez des résumés courts, moyens ou détaillés
- **Flashcards interactives** : Créez automatiquement des cartes d'apprentissage
- **Chat intelligent** : Posez des questions sur vos documents et obtenez des réponses pertinentes
- **Interface moderne** : Design épuré avec React, Next.js et Tailwind CSS

## Prérequis

- Node.js 18+
- npm, yarn, pnpm ou bun
- Clé API Mistral AI
- Compte Supabase

## Installation

1. **Clonez le projet** :
   ```bash
   git clone <repository-url>
   cd smart-brief
   ```

2. **Installez les dépendances** :
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configurez les variables d'environnement** :
   ```bash
   cp .env.example .env.local
   ```

   Éditez `.env.local` et ajoutez :
   ```env
   MISTRAL_API_KEY=votre_clé_api_mistral
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_supabase
   ```

4. **Configurez Supabase** :
   - Créez un projet Supabase
   - Exécutez le schéma SQL (voir section Configuration)
   - Créez un bucket "documents" dans Supabase Storage

5. **Démarrez l'application** :
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Utilisation

### 1. Importer un document

1. Cliquez sur **"Importer un document"**
2. Sélectionnez un fichier PDF
3. Attendez le traitement automatique (extraction de texte + embeddings)

### 2. Générer un résumé

1. Allez dans l'onglet **"Résumé"**
2. Choisissez la longueur : Court, Moyen ou Approfondi
3. Cliquez sur **"Générer"**
4. Visualisez le résumé avec points clés et définitions

### 3. Créer des flashcards

1. Allez dans l'onglet **"Flashcards"**
2. Cliquez sur **"Générer les flashcards"**
3. Naviguez avec les flèches précédent/suivant
4. Utilisez le bouton "Retourner" pour voir la réponse

### 4. Chatter avec le document

1. Allez dans l'onglet **"Chat"**
2. Tapez votre question dans le champ de saisie
3. Appuyez sur Entrée ou cliquez sur envoyer
4. Obtenez des réponses basées sur le contenu du document

## Configuration

### Schéma SQL Supabase

```sql
-- Table des documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uuid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'en cours',
  pages INTEGER DEFAULT 1,
  file_path TEXT NOT NULL,
  full_text TEXT,
  session_token TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des chunks de documents
CREATE TABLE document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extensions et index
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX document_chunks_embedding_idx ON document_chunks 
USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX documents_session_token_idx ON documents(session_token);
```

### Configuration API

1. **Mistral AI API** :
   - Allez sur [Mistral AI Console](https://console.mistral.ai/)
   - Créez une clé API
   - Ajoutez-la à `MISTRAL_API_KEY`

2. **Supabase** :
   - Créez un compte sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Configurez les variables d'environnement avec vos clés

## Dépannage

### Problèmes courants

1. **Fichier avec espaces ne s'upload pas**
   -  **Corrigé** : Les noms de fichiers sont automatiquement encodés

2. **OCR échoue**
   - Vérifiez que le fichier ne dépasse pas 20MB
   - Assurez-vous que votre clé Mistral est valide
   - Vérifiez la console pour les erreurs détaillées

3. **Upload très lent**
   - Les gros fichiers prennent plus de temps à traiter
   - Soyez patient pendant l'extraction et la génération d'embeddings

4. **Chat ne répond pas**
   - Vérifiez que le document a été traité avec succès
   - Consultez les logs du serveur pour les erreurs

### Développement

Pour le développement :

1. **Logs détaillés** : Consultez la console du navigateur et les logs du serveur
2. **Débogage** : Les logs incluent des émojis pour faciliter le suivi
3. **Rechargement** : L'application se recharge automatiquement avec `npm run dev`

## Structure du projet

```
smart-brief/
├── app/                    # Pages Next.js et API routes
│   ├── actions/           # Server actions (upload, traitement)
│   ├── api/              # API routes (chat, process-pdf)
│   └── documents/        # Pages des documents
├── components/            # Composants React
│   ├── chat/             # Interface du chat
│   ├── flashcard/        # Composants des flashcards
│   ├── forms/            # Formulaires d'upload
│   └── layout/           # Header, navigation
├── lib/                   # Bibliothèques utilitaires
│   ├── prompts/          # Prompts pour l'IA
│   ├── types/            # Types TypeScript
│   └── supabase.ts       # Client Supabase
├── hooks/                 # Hooks React personnalisés
└── public/               # Fichiers statiques
```

## Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonction`)
3. Commitez vos changements (`git commit -am 'Ajout d'une nouvelle fonction'`)
4. Pussez vers la branche (`git push origin feature/nouvelle-fonction`)
5. Créez une Pull Request

## Licence

Ce projet est sous licence MIT.

## Liens utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Mistral AI API](https://docs.mistral.ai/)
- [pdf-parse](https://www.npmjs.com/package/pdf-parse)

---

**Smart Brief** - Analysez vos documents, comprenez mieux 🎯
