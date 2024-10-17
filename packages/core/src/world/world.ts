import { Logger, LoggerColors } from "@serenityjs/logger";

import { Serenity } from "../serenity";
import { DimensionProperties, WorldProperties } from "../types";
import { Entity, EntityPalette, Player } from "../entity";

import { WorldProvider } from "./provider";
import { DefaultDimensionProperties, Dimension } from "./dimension";

import type { TerrainGenerator } from "./generator";

const DefaultWorldProperties: WorldProperties = {
  identifier: "default"
};

class World {
  public readonly serenity: Serenity;

  public readonly properties: WorldProperties = DefaultWorldProperties;

  public readonly identifier: string;

  public readonly provider: WorldProvider;

  public readonly dimensions = new Map<string, Dimension>();

  public readonly logger: Logger;

  public readonly entityPalette = new EntityPalette();

  public currentTick = 0n;

  public dayTime = 0;

  public constructor(
    serenity: Serenity,
    provider: WorldProvider,
    properties?: Partial<WorldProperties>
  ) {
    // Assign the serenity and provider to the world
    this.serenity = serenity;
    this.provider = provider;

    // Assign the properties to the world with the default properties
    this.properties = { ...DefaultWorldProperties, ...properties };

    // Assign the identifier to the world
    this.identifier = this.properties.identifier;

    // Create a new logger for the world
    this.logger = new Logger(this.identifier, LoggerColors.GreenBright);
  }

  /**
   * Ticks the world with a given delta tick.
   * @param deltaTick The delta tick to tick the world with.
   */
  public onTick(deltaTick: number): void {
    // Return if there are no players in the world
    if (this.getPlayers().length === 0) return;

    // Increment the current tick
    ++this.currentTick;

    // Increment the day time; day time is 24000 ticks long
    this.dayTime = (this.dayTime + 1) % 24_000;

    // Attempt to tick each dimension
    for (const dimension of this.dimensions.values()) {
      try {
        // Tick the dimension with the delta tick
        dimension.onTick(deltaTick);
      } catch (reason) {
        // Log that the dimension failed to tick
        this.logger.error(
          `Failed to tick dimension ${dimension.identifier}`,
          reason
        );
      }
    }
  }

  /**
   * Creates a new dimension with the specified generator and properties.
   * @param generator The generator to use for the dimension
   * @param properties The properties to use for the dimension
   * @returns The created dimension, if successful; otherwise, false
   */
  public createDimension(
    generator: typeof TerrainGenerator,
    properties?: Partial<DimensionProperties>
  ): Dimension | false {
    // Create the dimension properties
    const dimensionProperties = {
      ...DefaultDimensionProperties,
      ...properties
    };

    // Check if the dimension already exists
    if (this.dimensions.has(dimensionProperties.identifier)) {
      // Log that the dimension already exists
      this.logger.error(
        `Failed to create dimension with identifier ${dimensionProperties.identifier} as it already exists`
      );

      // Return false if the dimension already exists
      return false;
    }

    // Create a new dimension
    const dimension = new Dimension(this, new generator(), dimensionProperties);

    // Register the dimension
    this.dimensions.set(dimension.identifier, dimension);

    // Log that the dimension has been created
    this.logger.debug(`Created dimension: ${dimension.identifier}`);

    // Return the created dimension
    return dimension;
  }

  /**
   * Get the default dimension for the world
   */
  public getDimension(): Dimension;

  /**
   * Get a dimension by the identifier from the world
   * @param identifier The identifier of the dimension
   * @returns The dimension, if found; otherwise, undefined
   */
  public getDimension(identifier: string): Dimension | undefined;

  /**
   * Get a dimension by the identifier from the world
   * @param identifier The identifier of the dimension
   * @returns The dimension, if found; otherwise, undefined
   */
  public getDimension(identifier?: string): Dimension | undefined {
    // Check if the identifier is undefined
    if (identifier === undefined) {
      // Get the first dimension
      return this.dimensions.values().next().value as Dimension;
    }

    // Get the dimension by the identifier
    return this.dimensions.get(identifier);
  }

  /**
   * Gets all the players in the world.
   * @returns An array of players.
   */
  public getPlayers(): Array<Player> {
    return [...this.dimensions.values()].flatMap((dimension) =>
      dimension.getPlayers()
    );
  }

  /**
   * Gets all the entities in the world.
   * @returns An array of entities.
   */
  public getEntities(): Array<Entity> {
    return [...this.dimensions.values()].flatMap((dimension) =>
      dimension.getEntities()
    );
  }
}

export { World };