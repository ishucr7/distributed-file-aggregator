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
  tabState?: [number, React.Dispatch<React.SetStateAction<number>>];
};

const Container = styled.div`
  width: 100%;
   .MuiTabs-flexContainer {
    padding-left: 13px;
  }
    
  .MuiTabs-root {
    background-color: '#ecf0f1';
    margin: '0 -16px 0 -29px';
  }

   .MuiTab-root {
    padding: 14px 20px 15px 20px;
    text-transform: capitalize;
    }
`



//   .MuiTab-root.Mui-selected {
//     font-weight: ${(props) => (props.newDesign ? 'normal' : 'bold')};
//     color: ${(props) => props.theme.primaryExtraDark};
//   }

//   span.MuiTabs-indicator {
//     background-color: ${(props) => props.theme.primaryAccent};
//   }

export function BaseTabs({ tabs, tabState }: BaseTabsProps) {
  const [value, setValue] = React.useState(0);
  const tabValue = tabState?.[0] ?? value;
  const setTabValue = tabState?.[1] ?? setValue;
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container>
      <Tabs value={tabValue} onChange={handleChange} aria-label="Tabs">
        {tabs.map((tab, index) => {
            console.log("index of tab", index);
          return (
            <Tab
              label={tab.label}
              key={index}
            />
          );
        })}
      </Tabs>
      {tabs[tabValue].children}
    </Container>
  );
}