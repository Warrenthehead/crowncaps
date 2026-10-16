import Standard from './Standard';
import AVenir from './AVenir';
import Vendu from './Vendu';

// Association clé du modèle -> composant React.
// Quand vous créez un nouveau modèle, ajoutez-le ici ET dans registry.js.
export const TEMPLATE_COMPONENTS = {
  standard: Standard,
  'a-venir': AVenir,
  vendu: Vendu,
};
