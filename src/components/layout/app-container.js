import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { styled, useTheme } from '@mui/material/styles';
import { IconButton, Toolbar, Typography } from '@mui/material';
import { Box, CssBaseline, Divider } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import Main from './main';
import DrawerItems from './drawer-items';
import QuadView from '../quad-view/quad-view-main_v4';
import Dashboard from '../dashboard/dashboard-main';
import VTReactExample from '../vtkExamples/vtk-react-example';

export default function AppContainer() {

    const theme = useTheme();
    const location = useLocation();

    return (
        <Box sx={{ display: 'flex' }}>
           <Dashboard />           
           {/* <VTReactExample /> */}
        </Box>
    )
}