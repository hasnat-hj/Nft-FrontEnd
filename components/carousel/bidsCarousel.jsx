import 'swiper/css';
import 'swiper/css/navigation';
import 'tippy.js/dist/tippy.css';

import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import React,{useEffect, useState} from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { Navigation, Pagination, Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { loadContracts } from '../../contractABI/interact';
import { bidsModalShow } from "../../redux/counterSlice";

const BidsCarousel = ({data}) => {
  const [modal,setModal]=useState(false)
  const [nftId,setNftId]=useState(0)
  const [nftprice,setNftPrice]=useState(0)
  const [address,setAddress]=useState(false)
  const dispatch = useDispatch();
  useEffect(() => {
      
(async()=>{
console.log("helo..............................................")
setAddress(await getAddress());
})()
    
  }, []);
  const getAddress=async()=>{
    const {address } = await loadContracts();
    return address
  }

  return (
    <>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar]}
        spaceBetween={30}
        slidesPerView="auto"
        loop={true}
        breakpoints={{
          240: {
            slidesPerView: 1,
          },
          565: {
            slidesPerView: 2,
          },
          1000: {
            slidesPerView: 3,
          },
          1100: {
            slidesPerView: 4,
          },
        }}
        navigation={{
          nextEl: ".bids-swiper-button-next",
          prevEl: ".bids-swiper-button-prev",
        }}
        className=" card-slider-4-columns !py-5"
      >
        {data&&data?.map((item) => {
          const { _id,id ,img, name, curbid:price, owner, category } =
            item;
          // console.log("imae", img)
          //   const base64String = btoa(
          //     String.fromCharCode(...new Uint8Array(img.data.data))
          //   );
          const itemLink = _id
          return (
            <SwiperSlide className="text-white" >
              <article>
                <div className="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg text-jacarta-500">
                  <figure>
                    {/* {`item/${itemLink}`} */}
                    <Link href={"/item/" + itemLink}>
                      <a>
                        <div className="w-full">
                          <img
                            src={img}
                            alt={name}
                            height={230}
                            width={230}
                            layout="responsive"
                            objectFit="cover"
                            className="rounded-[0.625rem] w-full"
                            
                          />
                        </div>
                      </a>
                    </Link>
                  </figure>
                  <div className="mt-4 flex items-center justify-between">
                    <Link href={"/item/" + itemLink}>
                      <a>
                        <span className="font-display text-jacarta-700 hover:text-accent text-base dark:text-white">
                          {name}
                        </span>
                      </a>
                    </Link>
                    <span className="dark:border-jacarta-600 border-jacarta-100 flex items-center whitespace-nowrap rounded-md border py-1 px-2">
                      <Tippy content={<span>Matic</span>}>
                        <img
                          src="/images/polygon-matic-logo.png"
                          alt=""
                          className="w-3 h-3 mr-1"
                        />
                      </Tippy>

                      <span className="text-green text-sm font-medium tracking-tight">
                        {price} Matic
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="dark:text-jacarta-300 text-jacarta-500">
                      Current Bid {" "}
                    </span>
                    <span className="dark:text-jacarta-100 text-jacarta-700">
                      {price} Matic
                    </span>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                  {  address==item.owner?<h1>Nft Created by you</h1>:
                  <button
                      type="button"
                      className="text-accent font-display text-sm font-semibold"
                      onClick={() =>dispatch(bidsModalShow(item))}
                    >
                      Place bid
                    </button>}

                    {/* <Likes
                      like={react_number}
                      classes="flex items-center space-x-1"
                    /> */}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>
      {/* <!-- Slider Navigation --> */}
      <div className="group bids-swiper-button-prev swiper-button-prev shadow-white-volume absolute !top-1/2 !-left-4 z-10 -mt-6 flex !h-12 !w-12 cursor-pointer items-center justify-center rounded-full bg-white p-3 text-jacarta-700 text-xl sm:!-left-6 after:hidden">
        <MdKeyboardArrowLeft />
      </div>
      <div className="group bids-swiper-button-next swiper-button-next shadow-white-volume absolute !top-1/2 !-right-4 z-10 -mt-6 flex !h-12 !w-12 cursor-pointer items-center justify-center rounded-full bg-white p-3 text-jacarta-700 text-xl sm:!-right-6 after:hidden">
        <MdKeyboardArrowRight />
      </div>
    </>
  );
};

export default BidsCarousel;






