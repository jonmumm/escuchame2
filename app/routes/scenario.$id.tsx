import { catchError } from "@jonmumm/utils/catchError";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { useLoaderData, useParams } from "@remix-run/react";
import { createAccessToken, createActorFetch } from "actor-kit/server";
import { ScenarioContext } from "~/scenario.context";
import { ScenarioMachine } from "~/scenario.machine";
import { ScenarioView } from "~/components/scenario/scenario-view";

export const meta: MetaFunction = () => {
  return [{ title: "Escuchame - Conversation" }];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const id = params.id!;
  const fetchScenario = createActorFetch<ScenarioMachine>({
    actorType: "scenario",
    host: context.env.ACTOR_KIT_HOST,
  });

  const accessToken = await createAccessToken({
    signingKey: context.env.ACTOR_KIT_SECRET,
    actorId: id,
    actorType: "scenario",
    callerId: context.userId,
    callerType: "client",
  });

  const [error, payload] = await catchError(
    fetchScenario({
      actorId: id,
      accessToken,
      input: {},
    })
  );

  if (error) {
    console.error(error);
    throw error;
  }

  return json({
    accessToken,
    payload,
    host: context.env.ACTOR_KIT_HOST,
  });
}

export default function ScenarioPage() {
  const { id } = useParams();
  const { host, accessToken, payload } = useLoaderData<typeof loader>();

  return (
    <ScenarioContext.Provider
      host={host}
      actorId={id!}
      accessToken={accessToken}
      checksum={payload.checksum}
      initialSnapshot={payload.snapshot}
    >
      <ScenarioView />
    </ScenarioContext.Provider>
  );
}
