const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});
const getGoods = async function() {
	const result = await fetch('db/db.json');
	if(!result.ok) {
		throw new Error(result.status);
	}

	return await result.json();
}


//cart
const cart = {
	cartGoods:[
		
	],
	renderCart(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({id,name,price,count})=>{  //деструктуризация
			const trGood = document.createElement("tr");
			trGood.className = 'cart-item';
			trGood.dataset.id = id;
			trGood.innerHTML = `
			<td>${name}</td>
			<td>${price}$</td>
			<td><button class="cart-btn-minus" data-id=${id}>-</button></td>
			<td>${count}</td>
			<td><button class="cart-btn-plus" data-id=${id}>+</button></td>
			<td>${price*count}$</td>
			<td><button class="cart-btn-delete" data-id=${id}>x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((sum,item)=>{
			return sum + item.price*item.count;
		},0);
		cartTableTotal.textContent=totalPrice +'$';
		
		cartCount.textContent = this.cartGoods.reduce((sum,item)=>{
			return sum +item.count;
		},0);
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item=> item.id!== id);
		this.renderCart();
	},
	minusGood(id){
		for( const item of this.cartGoods) {
			if(item.id ===id) {
				if(item.count ===1) this.deleteGood(id)
				else item.count--;
				break;
			}
		}
		this.renderCart();
	},
	plusGood(id){
		for( const item of this.cartGoods) {
			if(item.id ===id) {
				item.count++;
				break;
			}
		}
		this.renderCart();
	},
	addCartId(id){
		const goodItem = this.cartGoods.find(item => item.id === id);
		if(goodItem) {this.plusGood(id)}
		else{
			getGoods()
				.then(data=>data.find(item=> item.id===id))
				.then(({id,name,price}) => {this.cartGoods.push({//деструктуризация
					id,
					name,
					price,
					count:1,
				})
			})
			.then(()=>{this.renderCart()});
		}
		
	},
}

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector("#modal-cart");
const modalClose = document.querySelector(".modal-close");
const more = document.querySelector(".more");
const navigationItem = document.querySelectorAll(".navigation-link");
const longGoodsList = document.querySelector(".long-goods-list");
const cartTableGoods = document.querySelector(".cart-table__goods");
const cartTableTotal = document.querySelector(".card-table__total");
const cartCount = document.querySelector(".cart-count");
const modalForm = document.querySelector(".modal-form");

cartTableGoods.addEventListener("click", function(e){
	const target = e.target;
	if (target.tagName ==="BUTTON") {
		if(target.classList.contains('cart-btn-delete')){
			cart.deleteGood(target.dataset.id);
		};
	
		if(target.classList.contains('cart-btn-plus')){
			cart.plusGood(target.dataset.id);
		}
	
		if(target.classList.contains('cart-btn-minus')){
			cart.minusGood(target.dataset.id);
		}	
	}
	
});

document.body.addEventListener("click",function(e){
	let target = e.target.closest(".add-to-cart");
	if(target) {
		cart.addCartId(target.dataset.id);
	}

})

buttonCart.addEventListener("click", function() {
	cart.renderCart();
	modalCart.classList.add("show");
	
});

document.addEventListener("mouseup", function(e) {
	if(!e.target.closest(".modal")) {
		if (modalCart.classList.contains("show")) {
			modalCart.classList.remove("show");
		}
	}
});

modalClose.addEventListener("click", function() {
	modalCart.classList.remove("show");
})

// scroll smooth


function scrollTop() {
	const scrollLinks = document.querySelectorAll("a.scroll-link");

	for(let i=0;i<scrollLinks.length;i++) {
	scrollLinks[i].addEventListener("click", function(event) {
		event.preventDefault();
		const id = scrollLinks[i].getAttribute('href');
		document.querySelector(id).scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	});
}
}
scrollTop();

// goods view aall




const createCard = function(objCard) {
	const card = document.createElement("div");
	card.className = "col-lg-3 col-sm-6";
	card.innerHTML = `<div class="goods-card">
	${objCard.label.length>0 ? `<span class="label">${objCard.label}</span>`:""}
	<img src="db/${objCard.img}" alt="${objCard.name}" class="goods-image">
	<h3 class="goods-title">${objCard.name}</h3>
	<p class="goods-description">${objCard.description}</p>
	<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
		<span class="button-price">${objCard.price}$</span>
	</button>
	</div>`;
	return card;

};

const renderCards = function(data) {
	longGoodsList.textContent = "";
	const cards = data.map(good => createCard(good));
	longGoodsList.append(...cards);
	document.body.classList.add("show-goods");
};

more.addEventListener("click", function(e){
	e.preventDefault();
	document.querySelector(".navigation").scrollIntoView({
		behavior: "smooth",
		block: "start",
	});
})

const filterCards = function(field,value) {
	getGoods().then(data =>{
		return data.filter(good => good[field] === value)}).
	then(goods => renderCards(goods));
}



navigationItem.forEach(function(link){
	link.addEventListener('click', e =>{
		e.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		if (field) {
			filterCards(field,value);
			return;	
		}
		getGoods().then(data => renderCards(data));
	})
})
//server

const postData  = dataUser => fetch("server.php",{
	method:"POST",
	body:dataUser
});

modalForm.addEventListener("submit", function(e){
	e.preventDefault();

	const formData = new FormData(modalForm);
	formData.append('goods',JSON.stringify(cart.cartGoods));
	postData(formData)
	.then(response => {
		if(!response.ok) {
			throw new Error(response.status)
		}
		
		alert("Ваш заказ успешно отправлен")
	})
	.catch(error =>{console.error(error)})
	.finally(()=>{
		modalCart.classList.remove("show");
		modalForm.reset();
		cart.cartGoods.length=0;
		cart.renderCart();
	})
})