import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
} from "@nestjs/common";
import { FavouritesService } from "./favourites.service";
import { Response } from "express";
import { FavouriteDto } from "./dto/favourite.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@Controller("favourites")
@ApiBearerAuth()
@ApiTags("Favourites")
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Post()
  @ApiOperation({ summary: "Add or remove a movie from favourites" })
  @ApiBody({
    type: FavouriteDto,
    description: "Movie data to add or remove from favourites",
    examples: {
      valid: {
        summary: "example",
        value: {
          movieId: "string",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Favourite successfully added",
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: "Favourite successfully removed",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid or missing token",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error",
  })
  async manageFavourite(@Body() body: FavouriteDto, @Res() res: Response, @Request() req) {
    const { movieId } = body;
    try {
      const { status, ...rest } = await this.favouritesService.setFavoutite(movieId, req.user.sub);
      return res.status(status).json(rest);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        "Error del servidor, intente nuevamente",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get()
  @ApiOperation({ summary: "Returns all favourites for a user by ID Session" })
  @ApiParam({
    name: "id",
    type: String,
    description: "The ID of the user whose favourites are being retrieved",
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successfully retrieved the list of favourites",
    schema: {
      example: {
        message: "Favoritos obtenidos",
        data: [
          {
            id: "cm12k3uj20001qo25lvw56c38",
            movieId: "123",
            userId: "cm12hvxib0000b63royy9pjtw",
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found or no favourites found",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error",
  })
  async getFavourites(@Res() res: Response, @Request() req) {
    try {
      const { status, ...rest } = await this.favouritesService.allFavourites(req.user.sub);
      return res.status(status).json(rest);
    } catch (error) {
      throw new HttpException(
        "Error del servidor, intente nuevamente",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
