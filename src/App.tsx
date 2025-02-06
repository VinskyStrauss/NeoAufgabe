import '@mantine/core/styles.css';

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Accordion, AppShell, Burger, List, MantineProvider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { theme } from './theme';

export default function App() {
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();
  const [seoRouteMap, setSeoRouteMap] = useState<any>(null);

  // Parse routes into a nested structure
  const parseRoutes = (routes) => {
    const tree = {};

    Object.keys(routes).forEach((path) => {
      const parts = path.split('/').filter(Boolean); // Split by '/' and remove empty parts
      let current = tree;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = { children: {} };
        }
        if (index === parts.length - 1) {
          current[part].path = path; // Assign full path to the leaf node
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

      if (jsonData && jsonData.seoRouteMap) {
        const nestedRoutes = parseRoutes(jsonData.seoRouteMap);
        setSeoRouteMap(nestedRoutes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderNavigation = (tree) => {
    return Object.entries(tree).map(([key, value]) => {
      if (Object.keys(value.children).length > 0) {
        return (
          <Accordion key={key} variant="contained">
            <Accordion.Item value={key}>
              <Accordion.Control>{capitalizeFirstLetter(key)}</Accordion.Control>
              <Accordion.Panel>{renderNavigation(value.children)}</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      }

      return (
        <List.Item
          key={key}
          onClick={() => {
            navigate(`/${value.path}`);
          }}
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
            {seoRouteMap &&
              Object.entries(seoRouteMap).map(([parent, data]) => renderRoutes(data, `/${parent}`))}
          </Routes>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

const renderRoutes = (node, basePath) => {
  const routes = [];

  if (node.path) {
    routes.push(<Route key={node.path} path={node.path} element={<div>{node.path}</div>} />);
  }

  Object.entries(node.children || {}).forEach(([childKey, childValue]) => {
    routes.push(...renderRoutes(childValue, `${basePath}/${childKey}`));
  });

  return routes;
};

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
