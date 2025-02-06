import '@mantine/core/styles.css';

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AppShell, Burger, List, MantineProvider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Router } from './Router';
import { theme } from './theme';

export default function App() {
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();
  const [data, setData] = useState(null);
  const [seoRouteMap, setSeoRouteMap] = useState<any>(null); // Adjust the type if necessary
  const [routesList, setRoutesList] = useState<any>(null);
  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://partner-navigationservice.e-spirit.cloud/navigation/preview.20eb4e8b-19a2-496a-b151-3317cd7dacd9?language=de_DE&format=caas'
      );
      const jsonData = await response.json();
      setData(jsonData);

      // Assuming jsonData.seoRouteMap exists
      if (jsonData && jsonData.seoRouteMap) {
        setSeoRouteMap(jsonData.seoRouteMap);
        //Make the routes list nested,so if thhe link is
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch data on first render
  useEffect(() => {
    fetchData();
  }, []);

  console.log('data:', data);
  console.log('seoRouteMap:', seoRouteMap);

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
          <List>
            {seoRouteMap &&
              Object.entries(seoRouteMap).map(([url, value]) => (
                <List.Item
                  key={value}
                  onClick={() => {
                    navigate(url);
                  }}
                >
                  {' '}
                  {url.replace(/^\/|\/$/g, '')}
                </List.Item>
              ))}
          </List>
        </AppShell.Navbar>

        <AppShell.Main>
          <Routes>
            {seoRouteMap &&
              Object.entries(seoRouteMap).map(([url, value]) => (
                <Route key={value} path={url} element={<div>{url}</div>} />
              ))}
          </Routes>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
