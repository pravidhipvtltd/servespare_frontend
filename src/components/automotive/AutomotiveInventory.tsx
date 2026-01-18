import React, { useState } from 'react';
import { Brand, VehicleModel } from '../../types/automotive';
import { BrandsDirectory } from './BrandsDirectory';
import { VehicleList } from './VehicleList';
import { ModelPartsExplorer } from './ModelPartsExplorer';
import { ManualAddPart } from './ManualAddPart';

type ViewState = 
  | { type: 'brands' }
  | { type: 'vehicles'; brand: Brand }
  | { type: 'parts'; brand: Brand; model: VehicleModel }
  | { type: 'add-part'; brand?: Brand; model?: VehicleModel };

export const AutomotiveInventory: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({ type: 'brands' });

  const handleSelectBrand = (brand: Brand) => {
    setViewState({ type: 'vehicles', brand });
  };

  const handleSelectModel = (model: VehicleModel) => {
    if (viewState.type === 'vehicles') {
      setViewState({ type: 'parts', brand: viewState.brand, model });
    }
  };

  const handleAddPart = () => {
    if (viewState.type === 'parts') {
      setViewState({ 
        type: 'add-part', 
        brand: viewState.brand, 
        model: viewState.model 
      });
    }
  };

  const handleBackFromVehicles = () => {
    setViewState({ type: 'brands' });
  };

  const handleBackFromParts = () => {
    if (viewState.type === 'parts') {
      setViewState({ type: 'vehicles', brand: viewState.brand });
    }
  };

  const handleBackFromAddPart = () => {
    if (viewState.type === 'add-part' && viewState.model) {
      setViewState({ 
        type: 'parts', 
        brand: viewState.brand!, 
        model: viewState.model 
      });
    } else if (viewState.type === 'add-part' && viewState.brand) {
      setViewState({ type: 'vehicles', brand: viewState.brand });
    } else {
      setViewState({ type: 'brands' });
    }
  };

  const handlePartAddSuccess = () => {
    if (viewState.type === 'add-part' && viewState.model) {
      setViewState({ 
        type: 'parts', 
        brand: viewState.brand!, 
        model: viewState.model 
      });
    }
  };

  // Render current view
  if (viewState.type === 'brands') {
    return <BrandsDirectory onSelectBrand={handleSelectBrand} />;
  }

  if (viewState.type === 'vehicles') {
    return (
      <VehicleList
        brand={viewState.brand}
        onBack={handleBackFromVehicles}
        onSelectModel={handleSelectModel}
      />
    );
  }

  if (viewState.type === 'parts') {
    return (
      <ModelPartsExplorer
        model={viewState.model}
        onBack={handleBackFromParts}
        onAddPart={handleAddPart}
      />
    );
  }

  if (viewState.type === 'add-part') {
    return (
      <ManualAddPart
        onBack={handleBackFromAddPart}
        onSuccess={handlePartAddSuccess}
        preselectedBrand={viewState.brand}
        preselectedModel={viewState.model}
      />
    );
  }

  return null;
};
