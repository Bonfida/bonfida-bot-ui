import * as React from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { theme } from "./theme";
import NavigationFrame from "./components/NavigationFrame";

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <NavigationFrame>{children}</NavigationFrame>
    </MuiThemeProvider>
  );
};

export default App;
