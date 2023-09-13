export class RandomNumberGenerator {
  private static readonly min = 1;
  private static readonly max = 100;

  public static getRandomNumber(): number {
    return (
      Math.floor(Math.random() * (RandomNumberGenerator.max - RandomNumberGenerator.min + 1)) +
      RandomNumberGenerator.min
    );
  }

  public static generateRandomNumbers(n: number): number[] {
    const numbers = [];
    for (let i = 0; i < n; i++) {
      const randomNumber = RandomNumberGenerator.getRandomNumber();
      numbers.push(randomNumber);
    }
    return numbers;
  }
}
