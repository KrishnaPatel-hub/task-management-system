import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  constructor(private readonly config: ConfigService) {}

  async current(location: string) {
    const key = this.config.get<string>('OPENWEATHER_API_KEY');
    if (!key) throw new BadGatewayException('Weather integration is not configured');

    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('q', location);
    url.searchParams.set('appid', key);
    url.searchParams.set('units', 'metric');

    const response = await fetch(url);
    if (!response.ok) throw new BadGatewayException('Could not fetch weather for this location');

    const data = await response.json();
    return {
      location: data.name,
      country: data.sys?.country,
      temperature: data.main?.temp,
      feelsLike: data.main?.feels_like,
      humidity: data.main?.humidity,
      description: data.weather?.[0]?.description,
      icon: data.weather?.[0]?.icon,
      fetchedAt: new Date().toISOString(),
    };
  }
}
