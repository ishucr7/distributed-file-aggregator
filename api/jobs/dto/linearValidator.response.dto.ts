export interface LinerValidatorResponse {
    isSame: boolean;
    linearFilePath: string;
    outputBySystemFilePath: string;
    linearProcessingTime: number;
    systemProcessingTime: number;
}