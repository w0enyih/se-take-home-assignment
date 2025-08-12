export class Queue<T> {
    private items: T[] = [];

    enqueue(item: T): void {
        this.items.push(item);
    }

    enqueueTop(item: T): void {
        this.items.unshift(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    delete(item: T): void {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }

    size(): number {
        return this.items.length;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    clear(): void {
        this.items = [];
    }

    getAll(): T[] {
        return [...this.items];
    }
}
