import '@mantine/core/styles.css';

import { use, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { C } from 'vitest/dist/chunks/reporters.6vxQttCV';
import { Accordion, AppShell, Burger, List, MantineProvider } from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { theme } from './theme';

export default function App() {
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();
  //List of the data
  const [idMap, setIdMap] = useLocalStorage({
    key: 'idMap',
    defaultValue: null,
  });
  //List for the routes
  const [urlList, setUrlList] = useLocalStorage({
    key: 'urlList',
    defaultValue: null,
  });
  //List for the nested routes show, the navbar looks like a tree
  const [seoRouteMap, setSeoRouteMap] = useLocalStorage({
    key: 'seoRouteMap',
    defaultValue: {},
  });
  //First render
  const [firstRender, setFirstRender] = useLocalStorage({
    key: 'firstRender',
    defaultValue: true,
  });

  const parseRoutes = (routes: any) => {
    const tree = {};

    //Make a tree based on the input
    Object.keys(routes).forEach((path) => {
      const parts = path.split('/').filter(Boolean); //Split the path and remove empty strings
      let current: any = tree; //Start from the root of the tree

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = { children: {} }; //If the part does not exist, create it
        }
        if (index === parts.length - 1) {
          current[part].path = path; //If it is the last part, add the path
        }
        current = current[part].children; //Move down to the next level
      });
    });
    //Return the tree
    return tree;
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://partner-navigationservice.e-spirit.cloud/navigation/preview.20eb4e8b-19a2-496a-b151-3317cd7dacd9?language=de_DE&format=caas'
      );
      const jsonData = await response.json();
      console.log('Data fetched:', jsonData);
      if (jsonData && jsonData.idMap) {
        console.log('IdMap:', jsonData.idMap);
        setIdMap(jsonData.idMap);
      }
      if (jsonData && jsonData.seoRouteMap) {
        setUrlList(jsonData.seoRouteMap);
        const nestedRoutes = parseRoutes(jsonData.seoRouteMap);
        setSeoRouteMap(nestedRoutes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (firstRender) {
      fetchData();
      setFirstRender(false); // Prevent further fetches after the first render
      console.log('First render');
    }
  }, [firstRender]);

  const renderNavigation = (tree: any) => {
    return Object.entries(tree).map(([key, value]: [any, any]) => {
      if (Object.keys(value.children).length > 0) {
        return (
          <Accordion key={key} variant="contained">
            <Accordion.Item value={key}>
              <Accordion.Control>
                <span
                  style={{ cursor: value.path ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    if (value.path) {
                      e.stopPropagation();
                      const fullPath = value.path.startsWith('/') ? value.path : `/${value.path}`;
                      navigate(fullPath);
                    }
                  }}
                  onFocus={() => {
                    //Change the cursor style when the item is focused
                    document.body.style.cursor = 'pointer';
                  }}
                >
                  {capitalizeFirstLetter(key)}
                </span>
              </Accordion.Control>
              <Accordion.Panel>{renderNavigation(value.children)}</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      }

      return (
        <List.Item
          key={key}
          onClick={() => {
            const fullPath = value.path.startsWith('/') ? value.path : `/${value.path}`;
            navigate(fullPath);
          }}
          style={{ cursor: 'pointer', marginTop: 10 }}
        >
          {capitalizeFirstLetter(key)}
        </List.Item>
      );
    });
  };

  // Function to get the label from the idMap based on the id
  const getLabelForId = (id: string) => {
    if (idMap && idMap[id]) {
      return (idMap[id] as { label: string }).label || 'No label found';
    }
    return 'Label not available';
  };
  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <h2>NeoAufgabe</h2>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <List>{seoRouteMap && renderNavigation(seoRouteMap)}</List>
        </AppShell.Navbar>

        <AppShell.Main>
          <Routes>
            {urlList &&
              Object.entries(urlList).map(([url, value]: [string, any]) => (
                <Route
                  key={value}
                  path={url}
                  element={
                    <div>
                      <h1>Url: {url}</h1>
                      <h1>Value: {value}</h1>
                      <h2>Label: {getLabelForId(value)}</h2> {/* Fetch the label */}
                    </div>
                  }
                />
              ))}
            <Route path="/" element={<Navigate to={'/startseite/'} />} />
            <Route
              path="*"
              element={
                <div>
                  <h1>Page not found</h1>
                </div>
              }
            />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
