export function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}