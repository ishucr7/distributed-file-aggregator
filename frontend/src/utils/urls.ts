const SpaceIdentifier = 'special-enigma-5vv549wp5rxfwpj'

export const getSpacesUrl = (port: string) => { 
    return `https://${SpaceIdentifier}-${port}.app.github.dev`
}

export enum Ports {
    Backend = '3000',
    Flower = '5555',
    RabbitMQManagementUi = '15672'
}
  