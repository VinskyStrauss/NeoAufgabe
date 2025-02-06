import '@mantine/core/styles.css';

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Accordion, AppShell, Burger, List, MantineProvider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { theme } from './theme';

export default function App() {
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();
  //List of the data
  const [data, setData] = useState<any>(null);
  //List for the routes
  const [urlList, setUrlList] = useState<any>(null);
  //List for the nested routes show, the navbar looks like a tree
  const [seoRouteMap, setSeoRouteMap] = useState<any>(null);
  //First render
  const [firstRender, setFirstRender] = useState(true);

  const parseRoutes = (routes: any) => {
    const tree = {};

    Object.keys(routes).forEach((path) => {
      const parts = path.split('/').filter(Boolean);
      let current: any = tree;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = { children: {} };
        }
        if (index === parts.length - 1) {
          current[part].path = path;
        }
        current = current[part].children;
      });
    });

    return tree;
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://partner-navigationservice.e-spirit.cloud/navigation/preview.20eb4e8b-19a2-496a-b151-3317cd7dacd9?language=de_DE&format=caas'
      );
      const jsonData = await response.json();

      setData(jsonData);
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
          style={{ cursor: 'pointer' }}
        >
          {capitalizeFirstLetter(key)}
        </List.Item>
      );
    });
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
          <div>NeoAufgabe</div>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <List>{seoRouteMap && renderNavigation(seoRouteMap)}</List>
        </AppShell.Navbar>

        <AppShell.Main>
          <Routes>
            {urlList &&
              Object.entries(urlList).map(([url, value]: [string, any]) => (
                <Route key={value} path={url} element={<div>{url}</div>} />
              ))}
          </Routes>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
