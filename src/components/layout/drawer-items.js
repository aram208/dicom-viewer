import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MailIcon from '@mui/icons-material/Mail';
import GroupsIcon from '@mui/icons-material/Groups';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import GridViewIcon from '@mui/icons-material/GridView';


export default function DrawerItems({ open }) {

  const navigate = useNavigate();

  const dashboard = () => {
    navigate("/dashboard");
  }

  const inbox = () => {
    navigate("/singleview");
  }

  const manage_groups = () => {
    navigate("/manage-groups");
  }

  const manage_sandbox = () => {
    navigate("/model-sandbox");
  }

  const groups = () => {
    navigate("/groups");
  }

  return (
    <>
      <List>
        <ListItem key='1' disablePadding sx={{ display: 'block' }} onClick={dashboard}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <GridViewIcon />
            </ListItemIcon>
            <ListItemText primary='Dashboard' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <ListItem key='3' disablePadding sx={{ display: 'block' }} onClick={inbox}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <ViewSidebarIcon />
            </ListItemIcon>
            <ListItemText primary='Inbox' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem key='2' disablePadding sx={{ display: 'block' }} onClick={groups}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <GroupsIcon />
            </ListItemIcon>
            <ListItemText primary='Groups' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem key='4' disablePadding sx={{ display: 'block' }} onClick={manage_groups}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <ManageAccountsIcon />
            </ListItemIcon>
            <ListItemText primary='Groups' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>

        <ListItem key='5' disablePadding sx={{ display: 'block' }} onClick={manage_sandbox}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <ModelTrainingIcon />
            </ListItemIcon>
            <ListItemText primary='Model Manager' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>

      </List>
    </>
  )

}