// components/resume/ResumeSections.tsx
"use client";

import { motion } from "framer-motion";
import { FiFileText, FiStar, FiBook, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { ResumeSectionsProps, ResumeData } from "@/lib/types";

export function ResumeSections({ resume, resumeLength }: ResumeSectionsProps) {
  return (
    <>
      <OverviewSection overview={resume.overview} />
      
      {resume.keyPoints && resume.keyPoints.length > 0 && (
        <KeyPointsSection points={resume.keyPoints} />
      )}
      
      {resumeLength === "approfondi" && (
        <>
          {resume.definitions && resume.definitions.length > 0 && (
            <DefinitionsSection definitions={resume.definitions} />
          )}
          
          {resume.takeaways && resume.takeaways.length > 0 && (
            <TakeawaysSection takeaways={resume.takeaways} />
          )}
        </>
      )}
    </>
  );
}

function OverviewSection({ overview }: { overview: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <FiFileText className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Vue d'ensemble
        </h2>
      </div>
      <p className="text-gray-700 leading-relaxed pl-12">{overview}</p>
    </motion.section>
  );
}

function KeyPointsSection({ points }: { points: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-50 rounded-lg">
          <FiStar className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Points clés</h2>
      </div>
      <div className="space-y-3 pl-12">
        {points.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-start gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5"
            >
              <FiChevronRight className="w-3 h-3 text-indigo-600" />
            </motion.div>
            <span className="text-gray-700">{point}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function DefinitionsSection({ definitions }: { definitions: Array<{ term: string; definition: string }> }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-50 rounded-lg">
          <FiBook className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Définitions
        </h2>
      </div>
      <div className="grid gap-3 pl-12">
        {definitions.map((def, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, x: 5 }}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
          >
            <span className="font-medium text-indigo-600 block mb-1">
              {def.term}
            </span>
            <span className="text-gray-700">{def.definition}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function TakeawaysSection({ takeaways }: { takeaways: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-amber-50 rounded-lg">
          <FiCheckCircle className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          À retenir
        </h2>
      </div>
      <div className="bg-amber-50 rounded-xl p-6 pl-12">
        <ul className="space-y-2">
          {takeaways.map((takeaway, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-2"
            >
              <span className="text-amber-500 mt-1">★</span>
              <span className="text-gray-700">{takeaway}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
