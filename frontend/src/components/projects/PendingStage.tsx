interface PendingStageProps {
  title: string;
  agent: string;
}

const PendingStage = ({ title, agent }: PendingStageProps) => {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-sm text-muted-foreground">
        ○
      </div>

      <p className="mt-5 font-medium">{title}</p>

      <p className="mt-2 text-sm text-muted-foreground">
        {agent} will start automatically when the workflow reaches this stage.
      </p>
    </div>
  );
};

export default PendingStage;

