import React from "react";
import ErrorScreen from "../screens/ErrorScreen";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed", error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <ErrorScreen
          title="Unexpected app error"
          message="FlowCash ran into a problem, but the app stayed open."
          details={error.message}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
