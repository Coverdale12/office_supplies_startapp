import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  CssBaseline,
  Box,
  Tooltip,
  IconButton
} from '@mui/material';
import { Brightness4, Brightness7, LocalShipping } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <LocalShipping sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Учет расходных материалов
          </Typography>
          <Tooltip title={`Переключить на ${mode === 'light' ? 'тёмную' : 'светлую'} тему`}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                ml: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'rotate(30deg)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box component="main">
          <Outlet />
        </Box>
      </Container>
    </>
  );
};

export default Layout;