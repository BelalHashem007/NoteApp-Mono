export default function DashboardView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-md text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-foreground">
            No note selected
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a note from the explorer or create a new one
          </p>
        </div>
      </div>
    </div>
  );
}
