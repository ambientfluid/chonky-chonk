declare module "draughts" {
  interface MoveObject {
    from: number;
    to: number;
    flags?: string;
    piece?: string;
    takes?: number[];
    captures?: number[];
    piecesCaptured?: string[];
    piecesTaken?: string[];
    jumps?: number[];
  }

  interface DraughtsInstance {
    WHITE: string;
    BLACK: string;
    MAN: string;
    KING: string;

    load(fen: string): boolean;
    reset(): void;
    clear(): void;

    moves(): MoveObject[];
    getMoves(square: number): MoveObject[];
    getLegalMoves(square: number): MoveObject[];
    captures(): MoveObject[];

    gameOver(): boolean;
    inDraw(): boolean;
    turn(): string;

    move(moveObj: { from: number; to: number }): MoveObject | false;
    undo(): MoveObject | null;

    put(piece: string, square: number): boolean;
    get(square: number): string | null;
    remove(square: number): string | null;
    position(format?: string): string;

    validate_fen(fen: string): { valid: boolean; error?: { code: number; message: string }; fen: string };
    fen(): string;
    pdn(options?: { newline_char?: string; maxWidth?: number }): string;
    header(...args: string[]): Record<string, string>;

    history(options?: { verbose?: boolean }): (string | MoveObject)[];
    ascii(): string;

    perft(depth: number): number;
  }

  interface DraughtsConstructor {
    new (fen?: string): DraughtsInstance;
    (fen?: string): DraughtsInstance;
  }

  const Draughts: DraughtsConstructor;
  export default Draughts;
}
