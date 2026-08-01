import type { CountryData } from '../assets/data/countries';
import { calculateGeoFeedback, type GeoFeedback } from './geo';

export type MatchStatus = 'correct' | 'close' | 'wrong';

export interface AttributeResult {
  attributeName: string;
  guessValue: string;
  targetValue: string;
  status: MatchStatus;
  indicatorSymbol?: string;
}

export interface GuessComparison {
  country: CountryData;
  isExactMatch: boolean;
  geo: GeoFeedback;
  attributes: {
    continent: AttributeResult;
    subregion: AttributeResult;
    population: AttributeResult;
    coastal: AttributeResult;
    language: AttributeResult;
    topExportSector: AttributeResult;
  };
}

export function compareCountries(
  guessed: CountryData,
  target: CountryData
): GuessComparison {
  const isExactMatch = guessed.id === target.id;
  const geo = calculateGeoFeedback(guessed.lat, guessed.lng, target.lat, target.lng);

  const continentMatch: MatchStatus =
    guessed.continent === target.continent ? 'correct' : 'wrong';

  const subregionMatch: MatchStatus =
    guessed.subregion === target.subregion ? 'correct' : 'wrong';

  const coastalMatch: MatchStatus =
    guessed.coastal === target.coastal ? 'correct' : 'wrong';

  const languageMatch: MatchStatus =
    guessed.language === target.language ? 'correct' : 'wrong';

  const exportSectorMatch: MatchStatus =
    guessed.topExportSector === target.topExportSector ? 'correct' : 'wrong';

  let popStatus: MatchStatus = 'wrong';
  let popSymbol = '';

  if (guessed.population === target.population) {
    popStatus = 'correct';
    popSymbol = '🎯';
  } else {
    const ratio = Math.max(guessed.population, target.population) / Math.min(guessed.population, target.population);
    popStatus = ratio <= 2.5 ? 'close' : 'wrong';
    popSymbol = target.population > guessed.population ? '⬆️' : '⬇️';
  }

  return {
    country: guessed,
    isExactMatch,
    geo,
    attributes: {
      continent: {
        attributeName: 'Continent',
        guessValue: guessed.continent,
        targetValue: target.continent,
        status: continentMatch,
        indicatorSymbol: continentMatch === 'correct' ? '🟩' : '⬜',
      },
      subregion: {
        attributeName: 'Subregion',
        guessValue: guessed.subregion,
        targetValue: target.subregion,
        status: subregionMatch,
        indicatorSymbol: subregionMatch === 'correct' ? '🟩' : '⬜',
      },
      population: {
        attributeName: 'Population',
        guessValue: guessed.populationDisplay,
        targetValue: target.populationDisplay,
        status: popStatus,
        indicatorSymbol: popSymbol,
      },
      coastal: {
        attributeName: 'Coastal Access',
        guessValue: guessed.coastal ? 'Coastal' : 'Landlocked',
        targetValue: target.coastal ? 'Coastal' : 'Landlocked',
        status: coastalMatch,
        indicatorSymbol: coastalMatch === 'correct' ? '🟩' : '⬜',
      },
      language: {
        attributeName: 'Language',
        guessValue: guessed.language,
        targetValue: target.language,
        status: languageMatch,
        indicatorSymbol: languageMatch === 'correct' ? '🟩' : '⬜',
      },
      topExportSector: {
        attributeName: 'Top Export Sector',
        guessValue: guessed.topExportSector,
        targetValue: target.topExportSector,
        status: exportSectorMatch,
        indicatorSymbol: exportSectorMatch === 'correct' ? '🟩' : '⬜',
      },
    },
  };
}
