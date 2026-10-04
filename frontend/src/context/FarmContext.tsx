import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, Farm, Field, Crop } from '../services/api';

interface FarmContextType {
  farms: Farm[];
  fields: Field[];
  crops: Crop[];
  selectedFarm: Farm | null;
  selectedField: Field | null;
  selectedCrop: Crop | null;
  setSelectedFarmId: (id: string) => void;
  setSelectedFieldId: (id: string) => void;
  refreshFarms: () => Promise<void>;
  isLoading: boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshFarms = async () => {
    setIsLoading(true);
    try {
      const farmsData = await api.getFarms();
      setFarms(farmsData);
      if (farmsData.length > 0) {
        const currentFarm = selectedFarm ? farmsData.find(f => f.id === selectedFarm.id) || farmsData[0] : farmsData[0];
        setSelectedFarm(currentFarm);

        const fieldsData = await api.getFields(currentFarm.id);
        setFields(fieldsData);
        if (fieldsData.length > 0) {
          const currentField = selectedField ? fieldsData.find(f => f.id === selectedField.id) || fieldsData[0] : fieldsData[0];
          setSelectedField(currentField);

          const cropsData = await api.getCrops(currentField.id);
          setCrops(cropsData);
          if (cropsData.length > 0) {
            setSelectedCrop(cropsData[0]);
          } else {
            setSelectedCrop(null);
          }
        } else {
          setSelectedField(null);
          setCrops([]);
          setSelectedCrop(null);
        }
      } else {
        setSelectedFarm(null);
        setFields([]);
        setSelectedField(null);
        setCrops([]);
        setSelectedCrop(null);
      }
    } catch (e) {
      console.error('Failed to load farm context', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFarms();
  }, []);

  const setSelectedFarmId = async (id: string) => {
    const f = farms.find(farm => farm.id === id);
    if (f) {
      setSelectedFarm(f);
      const fieldsData = await api.getFields(f.id);
      setFields(fieldsData);
      if (fieldsData.length > 0) {
        setSelectedField(fieldsData[0]);
        const cropsData = await api.getCrops(fieldsData[0].id);
        setCrops(cropsData);
        setSelectedCrop(cropsData.length > 0 ? cropsData[0] : null);
      } else {
        setSelectedField(null);
        setSelectedCrop(null);
      }
    }
  };

  const setSelectedFieldId = async (id: string) => {
    const f = fields.find(field => field.id === id);
    if (f) {
      setSelectedField(f);
      const cropsData = await api.getCrops(f.id);
      setCrops(cropsData);
      setSelectedCrop(cropsData.length > 0 ? cropsData[0] : null);
    }
  };

  return (
    <FarmContext.Provider
      value={{
        farms,
        fields,
        crops,
        selectedFarm,
        selectedField,
        selectedCrop,
        setSelectedFarmId,
        setSelectedFieldId,
        refreshFarms,
        isLoading,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within a FarmProvider');
  return context;
}
