import axios from 'axios'
import React, { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useQuery } from 'react-query'
import { toast } from 'react-toastify'
import auth from '../Firebase/firebase.init'
import Loading from '../Loading/Loading'
import Payment from './Payment'

const Orders = () => {
    const url = `http://localhost:5100/order/`
    const [show, setShow] = useState(false)
    const [order, setOrder] = useState({})
    const [clientSecret, setClientSecret] = useState("");

    const { isLoading, data, refetch } = useQuery(['Orders'], () =>
        fetch(url, {
            method: "get",
            headers: {
                auth: localStorage.getItem('accessToken')
            }
        }).then(res =>
            res.json()
        )
    )

    const deleteOrder = (id) => {
        axios({
            method: 'delete',
            url: `https://pero-assignment-12.herokuapp.com/order/${id}`,
            headers: {
                auth: localStorage.getItem('accessToken')
            }
        })
            .then(function (response) {
                console.log(response.data)
                refetch()
            });
    }
    function goForPay() {
        setShow(true)
        fetch("http://localhost:5100/payment/create-payment-intent", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: order.totalPrice }),
        })
            .then((res) => {
                if (res.status === 500) {
                    toast.error('Server Problem Plz Try Again')
                }
                return res.json()
            })
            .then((data) => {
                console.log(data);
                setClientSecret(data.clientSecret)
            });
    }
    if (isLoading) {
        return <Loading />
    }
    return (
        <div className='w-full'>
            <h1 className="text-4xl text-center font-bold">All Orders</h1>
            <div className="overflow-x-auto w-full mt-10">
                <table className="table-compact w-full">
                    {/* head */}
                    <thead>
                        <tr>
                            <th />
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price Per Product</th>
                            <th>Price Total</th>
                            <th>Quantity</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map(((product, index) =>
                                <tr key={product._id}>
                                    <th className='text-center'>{index + 1}</th>
                                    <td className='text-center'>
                                        <div className="avatar">
                                            <div className="w-24 rounded-xl">
                                                <img src={product.image} alt="" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className='text-center'>{product.name}</td>
                                    <td className='text-center'>${product.price}</td>
                                    <td className='text-center'>${product.totalPrice}</td>
                                    <td className='text-center'>{product.quantity}p</td>
                                    <td className='text-center'>{product.email}</td>
                                    <td className='text-center'>{product.phone}</td>
                                    <td className='text-center'>
                                        <div>
                                           {
                                           product.position === "paid" ? 
                                           <p className='text-xl pb-2 text-primary'>Processing..</p>
                                           :
                                           <button onClick={() => {
                                                goForPay()
                                                setOrder(product)
                                            }} to='/dashboard/payment' className="btn btn-primary mr-4">Not paid</button>
                                            
                                        }
                                            {
                                                product.position === "paid" ? <p className='text-green-500'>Trans Id : {product.paymentInfo.transactionId}</p>
                                                    :
                                                    <button className="btn btn-error" onClick={() => deleteOrder(product._id)}>Delete</button>}
                                        </div>
                                    </td>
                                </tr>))
                        }
                    </tbody>
                </table>
            </div>
            <PaymentModal show={show} setShow={setShow} order={order} clientSecret={clientSecret} />
        </div>
    )
}

export default Orders

const PaymentModal = ({ show, setShow, order, clientSecret }) => {

    return (
        <div className={`${show && clientSecret ? 'block' : "hidden"} absolute product-order-page top-0 right-0 z-10 w-full`}>
            <div className="hero min-h-screen">
                <div style={{ width: '100%' }} className="hero-content">

                    <div className="card relative w-full max-w-md shadow-2xl bg-base-100">
                        <button className='absolute top-0 right-0 bg-red-500 p-2 text-white' onClick={() => setShow(false)}>Close</button>
                        <div className="card-body w-full">
                            <Payment order={order} clientSecret={clientSecret} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}