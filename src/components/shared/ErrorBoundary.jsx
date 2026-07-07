import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Class component (required by React for error boundaries). Catches render
 * errors in any subtree so one broken card can't blank the whole app.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[Surya Center] UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5 text-center">
          <AlertTriangle className="h-5 w-5 text-danger mx-auto mb-2" />
          <p className="text-sm text-foreground-muted mb-3">
            Bagian ini gagal dimuat. Coba muat ulang halaman.
          </p>
          <Button size="sm" variant="secondary" onClick={() => this.setState({ hasError: false })}>
            Coba lagi
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
