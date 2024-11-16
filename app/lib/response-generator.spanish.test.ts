import { Observable } from "rxjs";
import { describe, expect, it } from "vitest";
import { ResponseGenerator } from "./response-generator";
import type { ModelObservableEvent } from "./structured-object-model";

describe("ResponseGenerator: Spanish Learning Scenarios", () => {
  async function processStream(
    observable: Observable<ModelObservableEvent<string, { nextResponse: string }>>
  ): Promise<{ nextResponse: string }> {
    return new Promise((resolve, reject) => {
      observable.subscribe({
        next: (event) => {
          if (event.type === "GENERATE_RESPONSE_COMPLETE") {
            resolve(event.data);
          }
        },
        error: reject,
        complete: () => {/* ignore completion */}
      });
    });
  }

  const spanishScenarios = [
    {
      name: "Beginner ordering coffee",
      transcribedText: "yo quiero um un cafe con leche",
      speechMetadata: {
        fluency: 0.3,  // 0-1 scale of speaking fluency
        confidence: 0.2,  // 0-1 scale of confidence
        troubledWords: ["café"],  // Words they struggled with
        notes: "Long pauses between words, unsure of article gender"
      },
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Hola! Bienvenido a la cafetería. ¿Qué desea tomar?"
        },
        {
          role: "user" as const,
          content: "yo quiero um un cafe con leche"
        }
      ],
      targetLanguage: "es",
      notes: "Basic ordering with clear hesitation and pronunciation issues"
    },
    {
      name: "Lost tourist seeking directions",
      transcribedText: "necesito ir a museo del prado",
      speechMetadata: {
        fluency: 0.4,
        confidence: 0.3,
        troubledWords: ["necesito", "museo"],
        notes: "Struggled with verb conjugation, stressed syllable placement issues"
      },
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Buenos días! ¿En qué puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "necesito ir a museo del prado"
        }
      ],
      targetLanguage: "es",
      notes: "Navigation request with pronunciation difficulties"
    },
    {
      name: "Restaurant order with vocabulary gaps",
      transcribedText: "quiero eggs y toast por favor",
      speechMetadata: {
        fluency: 0.2,
        confidence: 0.4,
        troubledWords: ["huevos", "tostada"],
        notes: "Resorts to English for unknown words, good basic sentence structure"
      },
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Buenos días, ¿qué le gustaría desayunar?"
        },
        {
          role: "user" as const,
          content: "quiero eggs y toast por favor"
        }
      ],
      targetLanguage: "es",
      notes: "Mixed language use due to vocabulary limitations"
    },
    {
      name: "Intermediate with verb conjugation issues",
      transcribedText: "Ayer yo ir al mercado y comprar frutas",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Hola! ¿Qué hiciste este fin de semana?"
        },
        {
          role: "user" as const,
          content: "Ayer yo ir al mercado y comprar frutas"
        }
      ],
      targetLanguage: "es",
      notes: "Past tense conjugation issues"
    },
    {
      name: "Advanced with subtle mistakes",
      transcribedText: "Si tendría más tiempo, estudiaría más español",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¿Cómo va tu estudio del español? ¿Tienes suficiente tiempo para practicar?"
        },
        {
          role: "user" as const,
          content: "Si tendría más tiempo, estudiaría más español"
        }
      ],
      targetLanguage: "es",
      notes: "Conditional tense misuse in si clause"
    },
    {
      name: "Mixed ability with cultural context",
      transcribedText: "Quiero comer la cena a las seis",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¿A qué hora prefieres cenar normalmente?"
        },
        {
          role: "user" as const,
          content: "Quiero comer la cena a las seis"
        }
      ],
      targetLanguage: "es",
      notes: "Cultural misunderstanding about Spanish dining times"
    },
    {
      name: "Beginner with vocabulary gaps",
      transcribedText: "Necesito... um... el thing para escribir... pen?",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¿Qué necesitas para la clase?"
        },
        {
          role: "user" as const,
          content: "Necesito... um... el thing para escribir... pen?"
        }
      ],
      targetLanguage: "es",
      notes: "Basic vocabulary gaps with English fallback"
    },
    {
      name: "Intermediate restaurant confusion",
      transcribedText: "La cuenta está correcta? Hay un error con los números",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Aquí tiene la cuenta, son 45 euros en total"
        },
        {
          role: "user" as const,
          content: "La cuenta está correcta? Hay un error con los números"
        }
      ],
      targetLanguage: "es",
      notes: "Question structure and formal situation handling"
    },
    {
      name: "Advanced but informal setting",
      transcribedText: "Tío, ayer la fiesta estuvo súper guay, pero me quedé sopa temprano",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¿Qué tal la fiesta de anoche? ¿Te divertiste?"
        },
        {
          role: "user" as const,
          content: "Tío, ayer la fiesta estuvo súper guay, pero me quedé sopa temprano"
        }
      ],
      targetLanguage: "es",
      notes: "Colloquial Spanish usage"
    },
    {
      name: "Medical appointment scenario",
      transcribedText: "Tengo dolor de... um... throat? desde tres días",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Buenos días, soy el Doctor García. ¿Qué síntomas tiene?"
        },
        {
          role: "user" as const,
          content: "Tengo dolor de... um... throat? desde tres días"
        }
      ],
      targetLanguage: "es",
      notes: "Medical vocabulary and time expression mistakes"
    },
    {
      name: "Shopping with regional variations",
      transcribedText: "Quiero comprar una camiseta pero no encuentro mi talla",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Hola! ¿En qué puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "Quiero comprar una camiseta pero no encuentro mi talla"
        }
      ],
      targetLanguage: "es",
      notes: "Shopping vocabulary and size system differences"
    },
    {
      name: "Complex restaurant order with follow-ups",
      transcribedText: "Y tienen opciones vegetarianas",
      speechMetadata: {
        fluency: 0.6,
        confidence: 0.7,
        troubledWords: ["vegetarianas"],
        notes: "Good flow but unsure about food vocabulary"
      },
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Buenas tardes! Bienvenidos al restaurante. ¿En qué puedo ayudarles?"
        },
        {
          role: "user" as const,
          content: "Hola, quisiera ver el menú por favor",
          speechMetadata: {
            fluency: 0.5,
            confidence: 0.6,
            troubledWords: ["quisiera"],
            notes: "Formal register attempted but hesitant"
          }
        },
        {
          role: "assistant" as const,
          content: "Por supuesto. Tenemos el menú del día que incluye entrada, plato principal y postre. ¿Le gustaría conocer las opciones?"
        },
        {
          role: "user" as const,
          content: "Sí, qué tienen de entrada",
          speechMetadata: {
            fluency: 0.5,
            confidence: 0.6,
            troubledWords: ["entrada"],
            notes: "Missing question marks, simplified structure"
          }
        },
        {
          role: "assistant" as const,
          content: "De entrada tenemos gazpacho, ensalada mixta o croquetas de jamón. ¿Cuál prefiere?"
        },
        {
          role: "user" as const,
          content: "Y tienen opciones vegetarianas",
          speechMetadata: {
            fluency: 0.6,
            confidence: 0.7,
            troubledWords: ["vegetarianas"],
            notes: "Question intonation but missing marks"
          }
        }
      ],
      targetLanguage: "es",
      notes: "Multi-turn restaurant conversation with dietary requirements"
    },
    {
      name: "Lost tourist with improving confidence",
      transcribedText: "ah entiendo entonces debo tomar el metro linea azul",
      speechMetadata: {
        fluency: 0.5,
        confidence: 0.7,
        troubledWords: ["línea", "debo"],
        notes: "Missing accents, but showing improved sentence structure"
      },
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Hola! ¿En qué puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "necesito ir a museum museo del prado",
          speechMetadata: {
            fluency: 0.3,
            confidence: 0.4,
            troubledWords: ["museo"],
            notes: "Mixed English/Spanish, uncertain pronunciation"
          }
        },
        {
          role: "assistant" as const,
          content: "¡Ah, el Museo del Prado! Está a unos 20 minutos de aquí. ¿Prefiere ir andando o en transporte público?"
        },
        {
          role: "user" as const,
          content: "transporte publico es mas facil",
          speechMetadata: {
            fluency: 0.4,
            confidence: 0.5,
            troubledWords: ["público", "fácil"],
            notes: "Missing accents, question structure avoided"
          }
        },
        {
          role: "assistant" as const,
          content: "Sí, es más fácil. Puede tomar el metro en la estación que está aquí cerca. La línea azul le lleva directamente."
        },
        {
          role: "user" as const,
          content: "ah entiendo entonces debo tomar el metro linea azul",
          speechMetadata: {
            fluency: 0.5,
            confidence: 0.7,
            troubledWords: ["línea", "debo"],
            notes: "Improved flow but still missing accents and question marks"
          }
        }
      ],
      targetLanguage: "es",
      notes: "Tourist gaining confidence through the conversation"
    },
    {
      name: "Phone service complaint escalation",
      transcribedText: "Esto es inaceptable, llevo esperando una semana",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Gracias por llamar a Servicio al Cliente. ¿En qué puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "Mi teléfono no funciona desde hace una semana"
        },
        {
          role: "assistant" as const,
          content: "Lamento escuchar eso. ¿Me puede dar su número de cuenta, por favor?"
        },
        {
          role: "user" as const,
          content: "Sí, es 12345. Ya llamé tres veces esta semana"
        },
        {
          role: "assistant" as const,
          content: "Veo las llamadas anteriores en el sistema. Un técnico debería haber visitado su domicilio ayer."
        },
        {
          role: "user" as const,
          content: "Nadie vino. Esto es inaceptable, llevo esperando una semana"
        }
      ],
      targetLanguage: "es",
      notes: "Handling customer complaints with increasing frustration"
    },
    {
      name: "Job interview with technical terms",
      transcribedText: "Sí, tengo experiencia con... um... how do you say 'spreadsheets'?",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Buenos días. Gracias por venir a la entrevista. ¿Me puede contar sobre su experiencia laboral?"
        },
        {
          role: "user" as const,
          content: "Buenos días. Trabajé tres años en una oficina de contabilidad"
        },
        {
          role: "assistant" as const,
          content: "Interesante. ¿Qué herramientas utilizaba en su trabajo diario?"
        },
        {
          role: "user" as const,
          content: "Usaba la computadora, programas de... um... accounting?"
        },
        {
          role: "assistant" as const,
          content: "¿Programas de contabilidad? ¿Puede ser más específico?"
        },
        {
          role: "user" as const,
          content: "Sí, tengo experiencia con... um... how do you say 'spreadsheets'?"
        }
      ],
      targetLanguage: "es",
      notes: "Professional context with technical vocabulary gaps"
    },
    {
      name: "Making weekend plans with friends",
      transcribedText: "¿Y si vamos al cine? Quiero ver la nueva película de acción",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Hola! ¿Qué planes tienes para el fin de semana?"
        },
        {
          role: "user" as const,
          content: "No sé todavía. ¿Tienes alguna sugerencia?"
        },
        {
          role: "assistant" as const,
          content: "¡Hay un nuevo restaurante en el centro! También podríamos ir al parque si hace buen tiempo."
        },
        {
          role: "user" as const,
          content: "El parque suena bien, pero depende del tiempo"
        },
        {
          role: "assistant" as const,
          content: "Es verdad. Según el pronóstico, va a llover. ¿Prefieres hacer algo en interior?"
        },
        {
          role: "user" as const,
          content: "¿Y si vamos al cine? Quiero ver la nueva película de acción"
        }
      ],
      targetLanguage: "es",
      notes: "Casual conversation with natural flow and suggestions"
    },
    {
      name: "Hesitant food order with background noise",
      transcribedText: "um... quiero... [pause] quiero la... la sopa de... *background noise* ...tomate?",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Buenas tardes! ¿Qué le gustaría ordenar?"
        },
        {
          role: "user" as const,
          content: "um... quiero... [pause] quiero la... la sopa de... *background noise* ...tomate?"
        }
      ],
      targetLanguage: "es",
      notes: "Speech with hesitations, pauses, and background noise artifacts"
    },
    {
      name: "Interrupted sentence at store",
      transcribedText: "necesito zapatos para... oh wait... para correr? running shoes?",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Hola! ¿En qué puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "necesito zapatos para... oh wait... para correr? running shoes?"
        }
      ],
      targetLanguage: "es",
      notes: "Self-interruption and English fallback"
    },
    {
      name: "Cut off mid-sentence",
      transcribedText: "sí, yo quiero reservar una mesa para cuatro person-",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Restaurante La Plaza, ¿en qué puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "sí, yo quiero reservar una mesa para cuatro person-"
        }
      ],
      targetLanguage: "es",
      notes: "Sentence cut off mid-word"
    },
    {
      name: "Multiple restarts and corrections",
      transcribedText: "no, no... quiero decir... es que... necesito cambiar la... el... la fecha de mi vuelo",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Aerolíneas del Sur, ¿en qué puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "no, no... quiero decir... es que... necesito cambiar la... el... la fecha de mi vuelo"
        }
      ],
      targetLanguage: "es",
      notes: "Multiple false starts and self-corrections"
    },
    {
      name: "Mixed language with speech recognition errors",
      transcribedText: "uhh... donde esta el... como se dice... bathroom? baño? es [unintelligible] urgente",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "¡Hola! ¿Puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "uhh... donde esta el... como se dice... bathroom? baño? es [unintelligible] urgente"
        }
      ],
      targetLanguage: "es",
      notes: "Speech recognition errors and mixed language use"
    },
    {
      name: "Emotional state affecting speech",
      transcribedText: "mi maleta... *sigh* ...no está aquí y mi vuelo es en... en... dos horas...",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Oficina de objetos perdidos, ¿en qué puedo ayudarle?"
        },
        {
          role: "user" as const,
          content: "mi maleta... *sigh* ...no está aquí y mi vuelo es en... en... dos horas..."
        }
      ],
      targetLanguage: "es",
      notes: "Emotional state (stress) affecting speech patterns"
    },
    {
      name: "Background conversation interference",
      transcribedText: "quiero... [background: excuse me] ...quiero comprar... [child crying] ...billetes para Madrid",
      conversationHistory: [
        {
          role: "assistant" as const,
          content: "Taquilla de la estación, buenos días"
        },
        {
          role: "user" as const,
          content: "quiero... [background: excuse me] ...quiero comprar... [child crying] ...billetes para Madrid"
        }
      ],
      targetLanguage: "es",
      notes: "Speech with background conversations and noise"
    }
  ];

  // Test each scenario
  for (const scenario of spanishScenarios) {
    it(`should handle ${scenario.name}`, async () => {
      console.log(`\n=== ${scenario.name} ===`);
      console.log("Context:", scenario.notes);
      console.log("\nConversation:");
      
      // Show only previous conversation history
      scenario.conversationHistory.forEach(msg => {
        console.log(`${msg.role === 'assistant' ? 'AI' : 'User'}: ${msg.content}`);
      });
      
      // Show current user input only if it's different from the last history message
      const lastHistoryMessage = scenario.conversationHistory[scenario.conversationHistory.length - 1];
      if (lastHistoryMessage?.content !== scenario.transcribedText) {
        console.log("User:", scenario.transcribedText);
      }

      // Generate and show AI response
      const generator = new ResponseGenerator();
      const output = await processStream(
        generator.getObservable({
          transcribedText: scenario.transcribedText,
          conversationHistory: scenario.conversationHistory,
          targetLanguage: scenario.targetLanguage,
        })
      );

      console.log("AI:", output.nextResponse);
      console.log("===============================");

      // Basic validation
      expect(output.nextResponse).toBeDefined();
      expect(typeof output.nextResponse).toBe("string");
      expect(output.nextResponse.length).toBeGreaterThan(0);
    });
  }
}); 