# InteractiveMap

Este projeto é um módulo em TypeScript que implementa um mapa interativo utilizando **React** e **React Leaflet**.

## Sobre o projeto

O objetivo deste projeto é fornecer um componente de mapa interativo, personalizável e fácil de integrar em aplicações
React. Ele utiliza a biblioteca [react-leaflet](https://react-leaflet.js.org/) para renderização de mapas, permitindo a
visualização de camadas, marcadores, edição de formas e funcionalidades como fullscreen e minimapa.

### Funcionalidades principais

- Visualização de GeoJSON e marcadores personalizados
- Controles de zoom, fullscreen e minimapa
- Edição e desenho de formas (polígonos, linhas, retângulos, marcadores)
- Suporte a diferentes camadas de mapas
- Ajuste automático de visualização para os dados carregados
- Requisição de dados GeoJSON via URL
- Requisição de dados das camadas de mapa via URL
- Aplicação de markers personalizados com ícones e popups

## Como usar

Este projeto já está configurado para usar o Leaflet na versão ^1.9.4, que é compatível com o React Leaflet ^4.2.1 e os plugins utilizados. Siga o passo a passo abaixo para instalar corretamente:

1. Instale as dependências necessárias no seu projeto React:
    ```bash
    npm install react react-dom react-leaflet leaflet leaflet-draw leaflet.fullscreen leaflet-minimap react-leaflet-draw react-leaflet-cluster
    ```
   
2. Instale as dependências de tipos para TypeScript:
    ```bash
    npm install --save-dev @types/react @types/react-dom @types/leaflet @types/leaflet-draw @types/leaflet.fullscreen @types/leaflet-minimap
    ```
3. Importe os estilos do Leaflet e dos pluginsno seu arquivo CSS principal:
    ```css
    import 'leaflet/dist/leaflet.css';
    ```
   
4. Importe e utilize o componente `InteractiveMap` no seu projeto:
    ```tsx
    import InteractiveMap from './path/to/InteractiveMap';

    const App = () => {
        return (
            <div>
                <h1>Meu Mapa Interativo</h1>
                <InteractiveMap />
            </div>
        );
    };

    export default App;
    ```

## Tecnologias utilizadas

- **React**: Biblioteca JavaScript para construção de interfaces de usuário.
- **React Leaflet**: Biblioteca para integração de mapas Leaflet com React.
- **Leaflet**: Biblioteca de código aberto para mapas interativos.
- **TypeScript**: Linguagem de programação que adiciona tipagem estática ao JavaScript.
