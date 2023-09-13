const SpaceIdentifier = 'ishucr7-dynamoflbackend-p338tqgn3o2'

const IS_GITPOD = true;

export const getSpacesUrl = (port: string) => { 
    return IS_GITPOD ? `https://${port}-${SpaceIdentifier}.ws-us104.gitpod.io`: `https://${SpaceIdentifier}-${port}.app.github.dev`
}

export enum Ports {
    Backend = '3000',
    Flower = '5555',
    RabbitMQManagementUi = '15672'
}
  