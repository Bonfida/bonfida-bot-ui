import React from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { theme } from "./theme";
import { WalletProvider } from "./utils/wallet";
import { ConnectionProvider } from "./utils/connection";
import { SnackbarProvider } from "notistack";

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConnectionProvider>
      <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
        <WalletProvider>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </MuiThemeProvider>
        </WalletProvider>
      </SnackbarProvider>
    </ConnectionProvider>
  );
};

export default App;
