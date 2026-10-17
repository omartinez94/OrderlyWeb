import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../ui/button";

interface Props {
  children: ReactNode;
  zoneName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ZoneErrorBoundary — catches React render-phase errors within a feature zone
 * (Admin, Kitchen, Restaurant) so that an error inside one view doesn't crash
 * the whole application or blank out navigation.
 */
export class ZoneErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[ZoneErrorBoundary:${this.props.zoneName ?? "Zone"}] caught an error:`,
      error,
      errorInfo,
    );
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="border-destructive/20 bg-destructive/5 max-w-md space-y-4 rounded-xl border p-6 shadow-sm">
            <h2 className="font-display text-destructive text-xl font-semibold">
              {this.props.zoneName ? `${this.props.zoneName} Error` : "Section Error"}
            </h2>
            <p className="text-ink-muted text-sm">
              Something went wrong while rendering this section. You can try refreshing or resetting
              the view.
            </p>
            {this.state.error?.message && (
              <p className="text-ink-subtle bg-surface-overlay border-border/40 overflow-x-auto rounded border p-2 font-mono text-xs">
                {this.state.error.message}
              </p>
            )}
            <div className="flex justify-center gap-3 pt-2">
              <Button size="sm" onClick={this.handleReset}>
                Try again
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
