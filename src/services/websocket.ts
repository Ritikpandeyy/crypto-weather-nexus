'use client';

import { store } from '@/store/store';
import { updateCryptoPrices, triggerPriceAlert } from '@/store/slices/cryptoSlice';
import { triggerWeatherAlert } from '@/store/slices/weatherSlice';

class AlertService {
  private intervalId: NodeJS.Timeout | null = null;
  private updateInterval = 10000; // 10 seconds
  private alertThreshold = 2.0; // alert on 2.0% change
  private lastAlerts: { [key: string]: number } = {};
  private alertCooldown = 300000; // 5 minutes between alerts for the same asset
  private weatherCheckInterval = 60000; // Check weather every minute now
  private lastWeatherCheck = 0;

  public connect() {
    if (this.intervalId) {
      return;
    }

    console.log('Alert service started');
    
    // Start regular price updates
    this.intervalId = setInterval(() => {
      this.updateData();
    }, this.updateInterval);
    
    // Do initial update
    this.updateData();
  }

  private updateData() {
    // Update crypto prices
    store.dispatch(updateCryptoPrices())
      .then(() => {
        this.checkForCryptoAlerts();
      })
      .catch(error => {
        console.error('Error updating crypto prices:', error);
      });

    // Check for weather alerts less frequently
    const now = Date.now();
    if (now - this.lastWeatherCheck > this.weatherCheckInterval) {
      this.lastWeatherCheck = now;
      this.checkForWeatherAlerts();
    }
  }

  private checkForCryptoAlerts() {
    const state = store.getState();
    const coins = state.crypto.coins;
    const now = Date.now();

    Object.entries(coins).forEach(([id, coin]) => {
      const priceChange = coin.market_data.price_change_percentage_24h;
      
      // Check if price change is significant and we haven't alerted recently
      if (Math.abs(priceChange) >= this.alertThreshold && 
          (!this.lastAlerts[id] || now - this.lastAlerts[id] > this.alertCooldown)) {
        
        this.lastAlerts[id] = now;
        
        // Create and display notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const direction = priceChange > 0 ? 'up' : 'down';
          
          new Notification(`${coin.name} Price Alert`, {
            body: `${coin.name} price is ${direction} by ${Math.abs(priceChange).toFixed(2)}%`,
            icon: coin.image
          });
        }
        
        // Store alert in Redux
        store.dispatch(triggerPriceAlert({
          id,
          price: coin.market_data.current_price.usd,
          priceChange
        }));
        
        console.log(`Alert: ${coin.name} price changed by ${priceChange.toFixed(2)}%`);
      }
    });
  }

  private checkForWeatherAlerts() {
    const state = store.getState();
    const cities = state.weather.cities;
    const now = Date.now();

    Object.entries(cities).forEach(([cityName, data]) => {
      if (!data || !data.weather || !data.main) return;

      // Check for extreme weather conditions
      const temp = data.main.temp;
      const weatherId = data.weather[0].id;
      const weatherDescription = data.weather[0].description;

      // Alert on extreme temperatures
      if (temp > 35 && (!this.lastAlerts[`${cityName}-temp-high`] || now - this.lastAlerts[`${cityName}-temp-high`] > this.alertCooldown)) {
        this.lastAlerts[`${cityName}-temp-high`] = now;
        this.sendWeatherAlert(cityName, 'extreme-heat', `Extreme heat in ${cityName}: ${Math.round(temp)}°C`);
      }
      else if (temp < 0 && (!this.lastAlerts[`${cityName}-temp-low`] || now - this.lastAlerts[`${cityName}-temp-low`] > this.alertCooldown)) {
        this.lastAlerts[`${cityName}-temp-low`] = now;
        this.sendWeatherAlert(cityName, 'freezing', `Freezing temperature in ${cityName}: ${Math.round(temp)}°C`);
      }

      // Alert on extreme weather conditions
      if (weatherId !== undefined && (weatherId >= 200 && weatherId < 300) && (!this.lastAlerts[`${cityName}-thunderstorm`] || now - this.lastAlerts[`${cityName}-thunderstorm`] > this.alertCooldown)) {
        // Thunderstorm
        this.lastAlerts[`${cityName}-thunderstorm`] = now;
        this.sendWeatherAlert(cityName, 'thunderstorm', `Thunderstorm in ${cityName}: ${weatherDescription}`);
      }
      else if (weatherId !== undefined && (weatherId >= 500 && weatherId < 600) && (!this.lastAlerts[`${cityName}-rain`] || now - this.lastAlerts[`${cityName}-rain`] > this.alertCooldown)) {
        // Rain
        this.lastAlerts[`${cityName}-rain`] = now;
        this.sendWeatherAlert(cityName, 'rain', `Rain in ${cityName}: ${weatherDescription}`);
      }
      else if (weatherId !== undefined && (weatherId >= 600 && weatherId < 700) && (!this.lastAlerts[`${cityName}-snow`] || now - this.lastAlerts[`${cityName}-snow`] > this.alertCooldown)) {
        // Snow
        this.lastAlerts[`${cityName}-snow`] = now;
        this.sendWeatherAlert(cityName, 'snow', `Snow in ${cityName}: ${weatherDescription}`);
      }
    });
  }

  private sendWeatherAlert(city: string, type: string, message: string) {
    // Create and display notification
    if ('Notification' in window && Notification.permission === 'granted') {      
      new Notification(`Weather Alert for ${city}`, {
        body: message,
        icon: `/images/weather/${type}.png` // Fallback to a default if this doesn't exist
      });
    }
    
    // Store alert in Redux
    store.dispatch(triggerWeatherAlert({
      city,
      type
    }));
    
    console.log(`Weather Alert: ${message}`);
  }

  public requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  public disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Alert service stopped');
  }
}

export const alertService = new AlertService(); 