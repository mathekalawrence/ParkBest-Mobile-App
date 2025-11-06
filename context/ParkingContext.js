import React, { createContext, useContext, useReducer } from 'react';
import parkingService from '../services/parkingService';

const ParkingContext = createContext();

const initialState = {
  zones: [],
  selectedZone: null,
  availableSpots: [],
  selectedSpot: null,
  bookings: [],
  currentBooking: null,
  loading: false,
};

function parkingReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ZONES':
      return { ...state, zones: action.zones };
    case 'SET_SELECTED_ZONE':
      return { ...state, selectedZone: action.zone };
    case 'SET_AVAILABLE_SPOTS':
      return { ...state, availableSpots: action.spots };
    case 'SET_SELECTED_SPOT':
      return { ...state, selectedSpot: action.spot };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.bookings };
    case 'SET_CURRENT_BOOKING':
      return { ...state, currentBooking: action.booking };
    case 'ADD_BOOKING':
      return { 
        ...state, 
        bookings: [action.booking, ...state.bookings],
        currentBooking: action.booking 
      };
    default:
      return state;
  }
}

export function ParkingProvider({ children }) {
  const [state, dispatch] = useReducer(parkingReducer, initialState);

  const parkingContext = {
    ...state,
    
    loadZones: async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await parkingService.getParkingZones();
      
      if (result.success) {
        dispatch({ type: 'SET_ZONES', zones: result.data });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },

    selectZone: (zone) => {
      dispatch({ type: 'SET_SELECTED_ZONE', zone });
    },

    loadAvailableSpots: async (zoneId) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await parkingService.getAvailableSpots(zoneId);
      
      if (result.success) {
        dispatch({ type: 'SET_AVAILABLE_SPOTS', spots: result.data });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },

    selectSpot: (spot) => {
      dispatch({ type: 'SET_SELECTED_SPOT', spot });
    },

    createBooking: async (bookingData) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await parkingService.createBooking(bookingData);
      
      if (result.success) {
        dispatch({ type: 'ADD_BOOKING', booking: result.data });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },

    loadUserBookings: async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await parkingService.getUserBookings();
      
      if (result.success) {
        dispatch({ type: 'SET_BOOKINGS', bookings: result.data });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },

    checkIn: async (bookingId) => {
      const result = await parkingService.checkIn(bookingId);
      
      if (result.success) {
        // Update booking status in state
        const updatedBookings = state.bookings.map(booking =>
          booking.id === bookingId 
            ? { ...booking, status: 'active' }
            : booking
        );
        dispatch({ type: 'SET_BOOKINGS', bookings: updatedBookings });
      }
      
      return result;
    },

    checkOut: async (bookingId) => {
      const result = await parkingService.checkOut(bookingId);
      
      if (result.success) {
        // Update booking status in state
        const updatedBookings = state.bookings.map(booking =>
          booking.id === bookingId 
            ? { ...booking, status: 'completed' }
            : booking
        );
        dispatch({ type: 'SET_BOOKINGS', bookings: updatedBookings });
      }
      
      return result;
    },
  };

  return (
    <ParkingContext.Provider value={parkingContext}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
}