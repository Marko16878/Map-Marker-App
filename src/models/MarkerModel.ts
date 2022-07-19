export { MarkerModel }

class MarkerModel {
    position: { lat: number, lng: number };
    color: string;

    constructor(position: { lat: number, lng: number }, color: string) {
        this.position = position;
        this.color = color;
    }
}