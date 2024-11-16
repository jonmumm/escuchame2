import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { createOpenAI } from "@ai-sdk/openai";
import { trace } from "@opentelemetry/api";
import { DeepPartial, streamObject } from "ai";
import { nanoid } from "nanoid";
import { Observable, Subject } from "rxjs";
import { ZodSchema } from "zod";
import { getErrorMessage } from "./error";

type WithStart<T extends string> = `${T}_START`;
type WithProgress<T extends string> = `${T}_PROGRESS`;
type WithComplete<T extends string> = `${T}_COMPLETE`;

export type ModelObservableEvent<
  TEventType extends string,
  TOutput extends object | string
> =
  | {
      type: WithStart<TEventType>;
      id: string;
    }
  | {
      type: WithProgress<TEventType>;
      id: string;
      data: DeepPartial<TOutput>;
    }
  | {
      type: WithComplete<TEventType>;
      id: string;
      data: TOutput;
    };

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_GATEWAY_ID = process.env.CLOUDFLARE_GATEWAY_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const google = createGoogleGenerativeAI({
  apiKey: GOOGLE_API_KEY,
  // Only use Cloudflare gateway if both IDs are present
  ...(CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_GATEWAY_ID ? {
    baseURL: `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_GATEWAY_ID}/google-ai-studio`,
  } : {}),
});

export abstract class StructuredObjectModel<
  TInput,
  TOutput extends object | string
> {
  private id: string;

  constructor(id?: string) {
    this.id = id || nanoid();
  }

  protected abstract getSchema(): ZodSchema<TOutput>;
  protected abstract getSystemMessage(input: TInput): Promise<string>;
  protected abstract getUserMessage(input: TInput): Promise<string>;
  protected abstract getName(): string;

  public getObservable(
    input: TInput
  ): Observable<ModelObservableEvent<string, TOutput>> {
    const eventType = this.getName();
    const subject = new Subject<ModelObservableEvent<string, TOutput>>();
    const schema = this.getSchema();
    const span = trace.getTracer("default").startSpan(this.getName());

    (async () => {
      subject.next({
        type: `$$xstate.init`,
      } as any);

      try {
        subject.next({
          type: `${eventType}_START` as WithStart<string>,
          id: this.id,
        });

        const objectStream = await streamObject({
          model: google("models/gemini-1.5-flash-latest"),
          system: await this.getSystemMessage(input),
          prompt: await this.getUserMessage(input),
          schema,
        });

        let partialObject: DeepPartial<TOutput>;
        for await (const _partialObject of objectStream.partialObjectStream) {
          subject.next({
            type: `${eventType}_PROGRESS` as WithProgress<string>,
            id: this.id,
            data: _partialObject as DeepPartial<TOutput>,
          });
          partialObject = _partialObject;
        }

        const finalObject = schema.parse(partialObject!);

        subject.next({
          type: `${eventType}_COMPLETE` as WithComplete<string>,
          id: this.id,
          data: finalObject,
        });
      } catch (error) {
        console.error("Error:", error);
        subject.error({
          type: "$$xstate.error",
          error: new Error(getErrorMessage(error)),
          outputRaw: "",
        });
      } finally {
        subject.complete();
        span.end();
      }
    })();

    return subject.asObservable();
  }
}
