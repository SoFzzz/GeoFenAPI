/**
 * Interfaz que define la estructura de una Lista de compras en GeoFen.
 * En TypeScript, las interfaces definen contratos de tipos en tiempo de compilación
 * sin generar sobrecarga ni código JavaScript al compilar.
 */
export interface List {
  id: number;
  name: string;
  items: string[];
}
