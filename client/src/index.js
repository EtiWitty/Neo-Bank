import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
//import App from './App';
import SignInSide from "./SignInSide";
import theme from './theme';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    {/* <App /> */}
    <SignInSide />
  </ThemeProvider>,
  document.querySelector('#root'),
);

export default combineReducers({
  auth: authReducer,
  errors: errorReducer
});
