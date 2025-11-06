import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
{{#if (eq uiFramework 'ant-design')}}
import 'antd/dist/reset.css';
{{/if}}
{{#if (eq uiFramework 'material-ui')}}
import '@mui/material/styles';
{{/if}}
{{#if (eq uiFramework 'chakra-ui')}}
import { ChakraProvider } from '@chakra-ui/react';
{{/if}}
{{#if (eq uiFramework 'tailwind')}}
import './index.css';
{{/if}}
{{#unless (eq uiFramework 'tailwind')}}
import './index.css';
{{/unless}}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {{#if (eq uiFramework 'chakra-ui')}}
    <ChakraProvider>
      <App />
    </ChakraProvider>
    {{else}}
    <App />
    {{/if}}
  </React.StrictMode>,
);