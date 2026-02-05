export class Position {
  constructor(
    public readonly row: number,
    public readonly col: number,
  ) {
    if (!this.isValid()) {
      throw new Error(`Invalid position: [${row}, ${col}]`);
    }
  }

  private isValid(): boolean {
    return this.row >= 0 && this.row < 8 && this.col >= 0 && this.col < 8;
  }

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  toNotation(): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rank = 8 - this.row;
    return `${files[this.col]}${rank}`;
  }

  static fromNotation(notation: string): Position {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const file = notation[0];
    const rank = parseInt(notation[1], 10);
    const col = files.indexOf(file);
    const row = 8 - rank;
    return new Position(row, col);
  }
}
