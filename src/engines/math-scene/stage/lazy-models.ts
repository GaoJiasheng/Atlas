/** Model renderers are requested only by the active topic/beat's model kind. */
import { lazy } from 'react';

export const BarModel = lazy(() => import('./BarModel').then((m) => ({ default: m.BarModel })));
export const CircleModel = lazy(() => import('./CircleModel').then((m) => ({ default: m.CircleModel })));
export const NumberLine = lazy(() => import('./NumberLine').then((m) => ({ default: m.NumberLine })));
export const Rows = lazy(() => import('./Rows').then((m) => ({ default: m.Rows })));
export const BarModelDiagram = lazy(() => import('./BarModelDiagram').then((m) => ({ default: m.BarModelDiagram })));
export const CutBar = lazy(() => import('./CutBar').then((m) => ({ default: m.CutBar })));
export const ArrayModel = lazy(() => import('./ArrayModel').then((m) => ({ default: m.ArrayModel })));
export const BlocksModel = lazy(() => import('./BlocksModel').then((m) => ({ default: m.BlocksModel })));
export const WholeLine = lazy(() => import('./WholeLine').then((m) => ({ default: m.WholeLine })));
export const DecimalTask = lazy(() => import('./DecimalTask').then((m) => ({ default: m.DecimalTask })));
export const DecimalGrid = lazy(() => import('./DecimalGrid').then((m) => ({ default: m.DecimalGrid })));
export const PlaceValueChart = lazy(() => import('./PlaceValueChart').then((m) => ({ default: m.PlaceValueChart })));
export const DecimalLine = lazy(() => import('./DecimalLine').then((m) => ({ default: m.DecimalLine })));
export const InstrumentModel = lazy(() => import('./Instrument').then((m) => ({ default: m.InstrumentModel })));
export const ClockModel = lazy(() => import('./ClockModel').then((m) => ({ default: m.ClockModel })));
export const Timeline = lazy(() => import('./Timeline').then((m) => ({ default: m.Timeline })));
export const MoneyModel = lazy(() => import('./MoneyModel').then((m) => ({ default: m.MoneyModel })));
export const NetModel = lazy(() => import('./NetModel').then((m) => ({ default: m.NetModel })));
