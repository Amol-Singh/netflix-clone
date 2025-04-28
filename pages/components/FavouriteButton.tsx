import React, {useCallback, useMemo} from "react";
import { IoAddSharp, IoCheckmark } from "react-icons/io5";

import axios from "axios";

import useCurrentUser from "@/hooks/useCurrentUser";
import useFavourites from "@/hooks/useFavourites";

interface FavouriteButtonProps {
     movieId : string;
}

const FavouriteButton : React.FC<FavouriteButtonProps> = ({movieId}) => {

    const { mutate : mutateFavourites} = useFavourites();
    const { data : currentUser, mutate} = useCurrentUser();

    const isFavorite = useMemo(() => {
        const list = currentUser?.favourites || [];

        return list.includes(movieId);
    },[currentUser, movieId]);

    const toggleFavourites = useCallback(async() => {
        let response;

        if(isFavorite) {
            response = await axios.delete("/api/favourite", { data : { movieId } });
        } else {
            response = await axios.post("/api/favourite", { movieId });
        }

        const updatedFavouriteIds = response?.data?.favouriteIds;

        mutate ({
            ...currentUser,
            favouriteIds : updatedFavouriteIds
        });

        mutateFavourites();
    }, [movieId, isFavorite, currentUser, mutate, mutateFavourites]);

    const Icon = isFavorite ? IoCheckmark : IoAddSharp;

    return (
        <div
        onClick={toggleFavourites}
        className="
        cursor-pointer group/item 
        w-6 h-6 lg:w-10 lg:h-10
        border-white border-2 rounded-full 
        flex justify-center items-center
        transition hover:border-neutral-300
        ">
            <Icon className="text-white" size={25} />
        </div>
    )
}

export default FavouriteButton;