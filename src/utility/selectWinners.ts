// Given the input array, select 2 random items in the array
// Items must be unique
export function selectWinners(
  userIds: string[],
  winnerCount: number
): string[] {
  const users = userIds.map((id) => {
    return { eligible: true, id: id };
  });
  const winners = [];

  // Choose winners while
  // 1. winners is less than winnerCount
  // 2. and we have eligible users to choose from
  while (
    winners.length < winnerCount &&
    users.filter((u) => u.eligible).length > 0
  ) {
    const eligible = users.filter((u) => u.eligible);
    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    const index = users.findIndex((u) => u.id === winner.id);
    users[index].eligible = false;
    winners.push(winner.id);
  }

  return winners;
}

//console.log(selectWinners(["Person1", "Person2", "Person3", "Person4"], 10));
