import React from 'react';

export type BooleanStateObject = [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
];

export type StringStateObject = [
    string,
    React.Dispatch<React.SetStateAction<string>>
];

export type NumberStateObject = [
    number,
    React.Dispatch<React.SetStateAction<number>>
];
