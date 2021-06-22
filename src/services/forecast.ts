import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import { InternalError } from '@src/util/errors/internal-error';
import { time } from 'console';

export enum BeachPosititon {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach {
  name: string;
  position: BeachPosititon;
  lat: number;
  lng: number;
  user: string;
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[]
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {

}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`)
  }
}

export class Forecast {

  constructor(protected stormGlass = new StormGlass()) { }

  public async processForecastForBeachs(beaches: Beach[]): Promise<TimeForecast[]> {
    try {
      const pointsWithCorrectSources: BeachForecast[] = []
      for (const beach of beaches) {
        const { lat, lng } = beach
        const points = await this.stormGlass.fetchPoints(lat, lng)
        const enrichedBeachData = this.enrichedBeachData(points, beach)
        pointsWithCorrectSources.push(...enrichedBeachData)
      }
      return this.mapForecastByTime(pointsWithCorrectSources);
    } catch (error) {
      throw new ForecastProcessingInternalError(error.message)
    }
  }

  private enrichedBeachData(points: ForecastPoint[], beach: Beach): BeachForecast[] {
    const { lat, lng, name, position } = beach
    return points.map(point => ({
      ...point,
      lat,
      lng,
      name,
      position,
      rating: 1
    }))

  }
  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time)
      if (timePoint) {
        timePoint.forecast.push(point)
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point]
        })
      }
    }
    return forecastByTime;
  }


}