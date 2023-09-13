import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import styled from 'styled-components';

export interface ITab {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export type BaseTabsProps = {
  tabs: ITab[];
};

const Container = styled.div`
  width: 100%;
`

export function BaseTabs({ tabs }: BaseTabsProps) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container>
      <Tabs value={value} onChange={handleChange} aria-label="Dynamo Tabs">
        {tabs.map((tab, index) => {
          return (
            <Tab
              label={tab.label}
              key={index}
            />
          );
        })}
      </Tabs>
      {tabs[value].children}
    </Container>
  );
}