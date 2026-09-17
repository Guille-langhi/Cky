import React, { useState } from "react";
import { X, GraduationCap, Award, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react";
import { Language } from "../types";
import { soundEngine } from "../lib/soundEngine";

interface SchoolTriviaMinigameProps {
  language: Language;
  onClose: () => void;
  onAddXP: (amount: number) => void;
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

interface Question {
  id: number;
  subject: string;
  questionEs: string;
  questionEn: string;
  optionsEs: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationEs: string;
  explanationEn: string;
  ckyThoughtEs: string;
  ckyThoughtEn: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "Geografía Argentina",
    questionEs: "¿Cuál es la provincia argentina conocida como la Cuna de la Bandera?",
    questionEn: "Which Argentine province is known as the Cradle of the National Flag?",
    optionsEs: ["Córdoba", "Santa Fe (Rosario)", "Buenos Aires", "Mendoza"],
    optionsEn: ["Córdoba", "Santa Fe (Rosario)", "Buenos Aires", "Mendoza"],
    correctIndex: 1,
    explanationEs: "En Rosario (Santa Fe), a orillas del río Paraná, Manuel Belgrano izó por primera vez la bandera celeste y blanca.",
    explanationEn: "In Rosario (Santa Fe), on the banks of the Paraná river, Manuel Belgrano first raised the sky-blue and white flag.",
    ckyThoughtEs: "¡Esta la sé de memoria, la vimos en el acto de la primaria con el monumento!",
    ckyThoughtEn: "I know this one by heart from primary school assembly with the monument!"
  },
  {
    id: 2,
    subject: "Biología y Ciencias",
    questionEs: "¿Qué células de la sangre son responsables de transportar el oxígeno?",
    questionEn: "Which blood cells are responsible for carrying oxygen through the body?",
    optionsEs: ["Glóbulos blancos (Leucocitos)", "Plaquetas", "Glóbulos rojos (Eritrocitos)", "Neuronas"],
    optionsEn: ["White blood cells", "Platelets", "Red blood cells (Erythrocytes)", "Neurons"],
    correctIndex: 2,
    explanationEs: "Los glóbulos rojos contienen hemoglobina, la proteína que fija el oxígeno en los pulmones y lo lleva a todo el cuerpo.",
    explanationEn: "Red blood cells contain hemoglobin, which binds oxygen in the lungs and delivers it everywhere.",
    ckyThoughtEs: "Son los rojitos redonditos que viajan a mil por hora...",
    ckyThoughtEn: "Those are the little round red ones zipping around..."
  },
  {
    id: 3,
    subject: "Historia Argentina",
    questionEs: "¿En qué histórica fecha se declaró formalmente la Independencia Argentina en Tucumán?",
    questionEn: "On what historic date was Argentine Independence formally declared in Tucumán?",
    optionsEs: ["25 de Mayo de 1810", "9 de Julio de 1816", "20 de Junio de 1820", "17 de Agosto de 1850"],
    optionsEn: ["May 25, 1810", "July 9, 1816", "June 20, 1820", "August 17, 1850"],
    correctIndex: 1,
    explanationEs: "El 9 de julio de 1816 en la histórica Casa de Tucumán se declaró la independencia de las Provincias Unidas.",
    explanationEn: "On July 9, 1816 in the historic House of Tucumán, the United Provinces declared independence.",
    ckyThoughtEs: "¡El 25 de mayo fue el primer gobierno patrio, no nos confundamos!",
    ckyThoughtEn: "May 25 was the first patriotic government, don't mix them up!"
  },
  {
    id: 4,
    subject: "Ciencias Naturales",
    questionEs: "¿Cómo se llama el proceso por el cual las plantas producen su alimento usando luz solar?",
    questionEn: "What is the name of the process plants use to produce their food using sunlight?",
    optionsEs: ["Fotosíntesis", "Fermentación", "Metamorfosis", "Polinización"],
    optionsEn: ["Photosynthesis", "Fermentation", "Metamorphosis", "Pollination"],
    correctIndex: 0,
    explanationEs: "La fotosíntesis convierte agua, dióxido de carbono y luz solar en glucosa y oxígeno.",
    explanationEn: "Photosynthesis converts water, carbon dioxide and sunlight into glucose and oxygen.",
    ckyThoughtEs: "¡Como la plantita de mamá que tiene los $500 escondidos en la maceta!",
    ckyThoughtEn: "Just like mom's plant that has the $500 hidden in the pot!"
  },
  {
    id: 5,
    subject: "Cultura y Vida Cotidiana",
    questionEs: "¿Cuál es el combo supremo de CKY para sobrevivir un lunes de colegio?",
    questionEn: "What is CKY's supreme combo to survive a school Monday?",
    optionsEs: ["Café negro amargo", "Sándwich de salame y queso + botella fresca", "Un paquete de galletitas de agua", "Una manzana verde sola"],
    optionsEn: ["Bitter black coffee", "Salami & cheese sandwich + fresh water", "A pack of plain water crackers", "A single green apple"],
    correctIndex: 1,
    explanationEs: "¡Insuperable! El sándwich de salame y queso de la heladera con la botella favorita es el combustible supremo de CKY.",
    explanationEn: "Unbeatable! The salami & cheese sandwich with the cold water bottle is CKY's supreme fuel.",
    ckyThoughtEs: "¡Jajaja el profesor Montenegro se apiadó de mí con esta!",
    ckyThoughtEn: "Hahaha Professor Montenegro showed mercy with this one!"
  }
];

export default function SchoolTriviaMinigame({
  language,
  onClose,
  onAddXP,
  onShowNotification
}: SchoolTriviaMinigameProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = QUESTIONS[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered || isFinished) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      soundEngine.playSfx("purchase");
      setCorrectAnswers(prev => prev + 1);
    } else {
      soundEngine.playSfx("hit");
    }
  };

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      const score = correctAnswers + (selectedOption === currentQ.correctIndex ? 0 : 0);
      const finalXP = score * 15;
      onAddXP(finalXP);
      soundEngine.playSfx("fanfare");

      if (onShowNotification) {
        onShowNotification({
          icon: "🎓",
          titleEs: `¡Examen Completado! Nota: ${score * 2}/10`,
          titleEn: `Exam Completed! Grade: ${score * 2}/10`,
          subEs: `Obtuviste +${finalXP} XP por responder ${score} de 5 preguntas correctamente.`,
          subEn: `Earned +${finalXP} XP for answering ${score} of 5 questions correctly.`,
          color: score >= 4 ? "emerald" : "amber"
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 font-mono select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-300">
                {language === "es" ? "Examen Sorpresa del Prof. Montenegro" : "Prof. Montenegro's Pop Quiz"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === "es" ? "Demuestra tus conocimientos en el aula" : "Show your classroom knowledge"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isFinished ? (
          <div className="space-y-4">
            {/* Progress & Subject */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400">
                📚 {currentQ.subject}
              </span>
              <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                {language === "es" ? `Pregunta ${currentIndex + 1} de ${QUESTIONS.length}` : `Question ${currentIndex + 1} of ${QUESTIONS.length}`}
              </span>
            </div>

            {/* Question Text */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
              <p className="text-sm font-bold text-slate-100 leading-relaxed">
                {language === "es" ? currentQ.questionEs : currentQ.questionEn}
              </p>
              <div className="mt-2 text-[11px] text-amber-400/80 italic flex items-center gap-1.5">
                <span>💭 CKY:</span>
                <span>"{language === "es" ? currentQ.ckyThoughtEs : currentQ.ckyThoughtEn}"</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {(language === "es" ? currentQ.optionsEs : currentQ.optionsEn).map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === currentQ.correctIndex;
                let btnStyle = "border-slate-800 bg-slate-950/70 hover:bg-slate-800 hover:border-amber-500/50 text-slate-300";

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold";
                  } else if (isSelected) {
                    btnStyle = "border-rose-500 bg-rose-950/60 text-rose-300";
                  } else {
                    btnStyle = "border-slate-800 bg-slate-950/40 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(i)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 animate-fade-in">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-400">
                    {language === "es" ? "Explicación: " : "Explanation: "}
                  </span>
                  {language === "es" ? currentQ.explanationEs : currentQ.explanationEn}
                </p>
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  {currentIndex < QUESTIONS.length - 1
                    ? (language === "es" ? "Siguiente Pregunta ➔" : "Next Question ➔")
                    : (language === "es" ? "Ver Calificación Final 🎓" : "View Final Grade 🎓")}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Final Grade Screen */
          <div className="text-center space-y-4 py-2 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-4xl shadow-xl">
              {correctAnswers >= 4 ? "🌟" : correctAnswers >= 2 ? "👍" : "📚"}
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">
                {language === "es" ? "Boletín de Calificaciones" : "School Report Card"}
              </h4>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {correctAnswers * 2} / 10
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {correctAnswers === 5
                  ? (language === "es" ? "¡Sobresaliente! El profesor Montenegro se puso de pie para aplaudir." : "Outstanding! Professor Montenegro stood up to applaud.")
                  : correctAnswers >= 3
                  ? (language === "es" ? "¡Aprobado con orgullo! Mamá va a estar contenta al ver el boletín." : "Passed with pride! Mom will be happy to see this.")
                  : (language === "es" ? "A estudiar más para la próxima... ¡Pero al menos CKY no se rindió!" : "Study harder next time... But at least CKY didn't give up!")}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>{language === "es" ? "Preguntas correctas:" : "Correct answers:"}</span>
                <span className="font-bold text-emerald-400">{correctAnswers} de 5</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{language === "es" ? "Experiencia ganada:" : "Experience gained:"}</span>
                <span className="font-bold text-amber-400">+{correctAnswers * 15} XP</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
            >
              {language === "es" ? "Cerrar Boletín Escolar" : "Close Report Card"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
