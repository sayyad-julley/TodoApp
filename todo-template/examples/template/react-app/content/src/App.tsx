import React from 'react';
{{#if useRouter}}
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
{{/if}}
{{#if (eq uiFramework 'ant-design')}}
import { Layout, Typography, Button } from 'antd';
{{/if}}
{{#if (eq uiFramework 'material-ui')}}
import { Box, Typography, Button, Container } from '@mui/material';
{{/if}}
{{#if (eq uiFramework 'chakra-ui')}}
import { Box, Heading, Button, Container, VStack } from '@chakra-ui/react';
{{/if}}

const {{#if (eq uiFramework 'ant-design')}}{ Header, Content, Footer } = Layout;{{/if}}
const {{#if (eq uiFramework 'material-ui')}}{}{{/if}}
const {{#if (eq uiFramework 'chakra-ui')}}{}{{/if}}

function App() {
  return (
    {{#if (eq uiFramework 'ant-design')}}
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Typography.Title level={3} style={{ color: 'white', margin: 0 }}>
          {{ __APP_NAME__ }}
        </Typography.Title>
      </Header>
      <Content style={{ padding: '50px' }}>
        <Typography.Title>Welcome to {{ __APP_NAME__ }}</Typography.Title>
        <Typography.Paragraph>
          {{ description }}
        </Typography.Paragraph>
        <Button type="primary">Get Started</Button>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        {{ __APP_NAME__ }} ©2024 Created with Backstage
      </Footer>
    </Layout>
    {{/if}}
    {{#if (eq uiFramework 'material-ui')}}
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {{ __APP_NAME__ }}
        </Typography>
        <Typography variant="body1" paragraph>
          {{ description }}
        </Typography>
        <Button variant="contained" color="primary">
          Get Started
        </Button>
      </Box>
    </Container>
    {{/if}}
    {{#if (eq uiFramework 'chakra-ui')}}
    <Container maxW="container.md" py={8}>
      <VStack spacing={4} align="center">
        <Heading as="h1" size="2xl">
          {{ __APP_NAME__ }}
        </Heading>
        <Box textAlign="center">
          {{ description }}
        </Box>
        <Button colorScheme="blue" size="lg">
          Get Started
        </Button>
      </VStack>
    </Container>
    {{/if}}
    {{#if (eq uiFramework 'none')}}
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        {{ __APP_NAME__ }}
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666', maxWidth: '600px' }}>
        {{ description }}
      </p>
      <button style={{
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        fontSize: '1rem',
        borderRadius: '6px',
        cursor: 'pointer'
      }}>
        Get Started
      </button>
    </div>
    {{/if}}
  );
}

export default App;