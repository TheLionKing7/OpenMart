export type Distributor = {
  id: string;
  name: string;
  stallLabel: string;
  servesMarkets: string[];
  lga: string;
};

export const distributors: Distributor[] = [
  {
    id: 'emeka-foods',
    name: 'Emeka Foods & Provisions',
    stallLabel: 'Block 12, Oke-Arin',
    servesMarkets: ['Oke-Arin Market'],
    lga: 'Lagos Island',
  },
  {
    id: 'balogun-wholesale',
    name: 'Balogun Wholesale Co.',
    stallLabel: 'Balogun Plaza',
    servesMarkets: ['Balogun Market', 'Oke-Arin Market'],
    lga: 'Lagos Island',
  },
  {
    id: 'idumota-traders',
    name: 'Idumota Traders Ltd',
    stallLabel: 'Lane 4, Idumota',
    servesMarkets: ['Idumota'],
    lga: 'Lagos Island',
  },
  {
    id: 'mushin-depot',
    name: 'Mushin FMCG Depot',
    stallLabel: 'Mushin Industrial Ave',
    servesMarkets: ['Mushin Open Market'],
    lga: 'Mushin',
  },
  {
    id: 'alaba-supply',
    name: 'Alaba Supply House',
    stallLabel: 'Section C, Alaba',
    servesMarkets: ['Alaba International'],
    lga: 'Surulere',
  },
];

export function getDistributor(id: string): Distributor | undefined {
  return distributors.find((d) => d.id === id);
}
